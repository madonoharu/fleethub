use itertools::Itertools;
use rand::Rng;
use wasm_bindgen::prelude::*;

use crate::{
    attack::WarfareShipEnvironment,
    fleet::Fleet,
    member::{Member, MemberMut},
    plane::{Plane, PlaneMut},
    ship::Ship,
    types::{
        AirWaveType, AntiAirCutinDef, BattleConfig, CompMeta, FleetType, Formation, OrgType, Role,
        Side,
    },
};

#[wasm_bindgen]
#[derive(Debug, Clone)]
pub struct Comp {
    pub org_type: OrgType,
    pub hq_level: u8,
    #[wasm_bindgen(getter_with_clone)]
    pub main: Fleet,
    #[wasm_bindgen(getter_with_clone)]
    pub escort: Option<Fleet>,
    #[wasm_bindgen(getter_with_clone)]
    pub route_sup: Option<Fleet>,
    #[wasm_bindgen(getter_with_clone)]
    pub boss_sup: Option<Fleet>,
}

impl Comp {
    pub fn night_fleet(&self) -> &Fleet {
        self.escort.as_ref().unwrap_or_else(|| &self.main)
    }

    pub fn members(&self) -> impl Iterator<Item = Member> {
        self.main
            .ships
            .iter()
            .map(|(index, ship)| Member {
                org_type: self.org_type,
                role: Role::Main,
                index,
                ship,
            })
            .chain(self.escort.iter().flat_map(|fleet| {
                fleet.ships.iter().map(|(index, ship)| Member {
                    org_type: self.org_type,
                    role: Role::Escort,
                    index,
                    ship,
                })
            }))
    }

    pub fn members_mut(&mut self) -> impl Iterator<Item = MemberMut> {
        self.main
            .ships
            .iter_mut()
            .map(|(index, ship)| MemberMut {
                org_type: self.org_type,
                role: Role::Main,
                index,
                ship,
            })
            .chain(
                self.escort
                    .iter_mut()
                    .flat_map(|fleet| fleet.ships.iter_mut())
                    .map(|(index, ship)| MemberMut {
                        org_type: self.org_type,
                        role: Role::Escort,
                        index,
                        ship,
                    }),
            )
    }

    pub fn planes(&self, escort_participates: bool) -> impl Iterator<Item = Plane> {
        let escort_planes = escort_participates
            .then(|| self.escort.as_ref())
            .flatten()
            .into_iter()
            .flat_map(|fleet| fleet.ships.values());

        self.main
            .ships
            .values()
            .chain(escort_planes)
            .flat_map(|ship| ship.planes())
    }

    pub fn planes_mut(&mut self, escort_participates: bool) -> impl Iterator<Item = PlaneMut> {
        let escort_planes = escort_participates
            .then(|| self.escort.as_mut())
            .flatten()
            .into_iter()
            .flat_map(|fleet| fleet.ships.values_mut());

        self.main
            .ships
            .values_mut()
            .chain(escort_planes)
            .flat_map(|ship| ship.planes_mut())
    }

    pub fn ships(&self) -> impl Iterator<Item = &Ship> {
        self.members().map(|entry| entry.ship)
    }

    pub fn ships_mut(&mut self) -> impl Iterator<Item = &mut Ship> {
        self.main.ships.values_mut().chain(
            self.escort
                .iter_mut()
                .flat_map(|fleet| fleet.ships.values_mut()),
        )
    }

    pub fn choose_anti_air_cutin<'a, R: Rng + ?Sized>(
        &self,
        rng: &mut R,
        config: &'a BattleConfig,
    ) -> Option<&'a AntiAirCutinDef> {
        self.members()
            .map(|entry| entry.ship)
            .filter_map(|ship| {
                let aaci_vec = ship.get_possible_anti_air_cutin_ids();

                let r = rng.gen_range(0.0..1.0);

                let aaci = aaci_vec
                    .into_iter()
                    .filter_map(|id| config.anti_air_cutin.get(&id))
                    .find(|aaci| {
                        let p = aaci.rate().unwrap_or_default();
                        if aaci.is_sequential() {
                            rng.gen_bool(p)
                        } else {
                            p > r
                        }
                    });

                aaci
            })
            .sorted_by(|a, b| a.id.cmp(&b.id).reverse())
            .next()
    }

    pub fn reset_battle_state(&mut self) {
        self.main.reset_battle_state();
        self.escort.as_mut().map(|f| f.reset_battle_state());
    }
}

#[wasm_bindgen]
impl Comp {
    pub fn side(&self) -> Side {
        self.org_type.side()
    }

    pub fn is_combined(&self) -> bool {
        self.escort.is_some()
    }

    pub fn is_player(&self) -> bool {
        self.org_type.is_player()
    }

    pub fn is_enemy(&self) -> bool {
        self.org_type.is_enemy()
    }

    pub fn meta(&self) -> CompMeta {
        let fleets = [FleetType::Main, FleetType::Escort, FleetType::RouteSup]
            .into_iter()
            .filter_map(|ft| {
                let fleet = self.get_fleet(ft)?;
                Some((ft, fleet.meta()))
            })
            .collect();

        CompMeta { fleets }
    }

    fn get_fleet(&self, ft: FleetType) -> Option<&Fleet> {
        Some(match ft {
            FleetType::Main => &self.main,
            FleetType::Escort => self.escort.as_ref()?,
            FleetType::RouteSup => self.route_sup.as_ref()?,
            _ => return None,
        })
    }

    pub fn get_fleet_id(&self, ft: FleetType) -> Option<String> {
        self.get_fleet(ft).map(|f| f.id.clone())
    }

    pub fn get_ship_with_clone(&self, ft: FleetType, key: &str) -> Option<Ship> {
        Some(self.get_fleet(ft)?.ships.get_by_key(key)?.clone())
    }

    pub fn get_ship_entity_id(&self, ft: FleetType, key: &str) -> Option<String> {
        Some(self.get_fleet(ft)?.ships.get_by_key(key)?.id.clone())
    }

    pub fn get_ship_by_eid_with_clone(&self, id: String) -> Option<Ship> {
        self.ships().find(|ship| ship.id == id).cloned()
    }

    pub fn default_formation(&self) -> Formation {
        self.org_type.default_formation()
    }

    /// 艦隊防空値
    pub fn adjusted_anti_air(&self, formation_mod: f64) -> f64 {
        let total = self
            .ships()
            .map(|ship| ship.fleet_anti_air_mod())
            .sum::<i32>() as f64;

        let post_floor = (total * formation_mod).floor() * 2.;

        if self.org_type.side().is_player() {
            post_floor / 1.3
        } else {
            post_floor
        }
    }

    /// 制空値
    pub fn fighter_power(&self, escort_participates: bool, air_type: AirWaveType) -> Option<i32> {
        let main_fp = self.main.fighter_power(air_type)?;

        if !escort_participates {
            Some(main_fp)
        } else {
            let escort_fp = self.escort.as_ref()?.fighter_power(air_type)?;
            Some(main_fp + escort_fp)
        }
    }

    /// マップ索敵
    pub fn elos(&self, node_divaricated_factor: u8) -> Option<f64> {
        let hq_level = self.hq_level;
        let main_elos = self.main.elos(hq_level, node_divaricated_factor)?;

        if let Some(escort) = self.escort.as_ref() {
            let escort_elos = escort.elos(hq_level, node_divaricated_factor)?;
            Some(main_elos + escort_elos)
        } else {
            Some(main_elos)
        }
    }

    /// 輸送物資量(TP)
    pub fn transport_point(&self) -> i32 {
        self.ships().map(|ship| ship.transport_point()).sum()
    }

    pub fn create_warfare_ship_environment(
        &self,
        ship: &Ship,
        formation: Formation,
    ) -> WarfareShipEnvironment {
        let (role, ship_index) = self
            .members()
            .find_map(|entry| (entry.ship == ship).then(|| (entry.role, entry.index)))
            .unwrap_or_default();

        let fleet = match role {
            Role::Main => &self.main,
            Role::Escort => self.escort.as_ref().unwrap_or_else(|| unreachable!()),
        };

        WarfareShipEnvironment {
            org_type: self.org_type,
            fleet_len: fleet.len,
            ship_index,
            role,
            formation,
            fleet_los_mod: fleet.fleet_los_mod(),
        }
    }
}

#[cfg(test)]
mod test {
    use crate::types::NightCutin;

    #[test]
    fn test() {
        let mut set = enumset::EnumSet::new();
        set.insert(NightCutin::Cvci1_18);
        set.insert(NightCutin::MainMainMain);
        set.insert(NightCutin::TorpLookoutRadar);

        set.into_iter().for_each(|ci| {
            println!("{:#?}", ci);
        })
    }
}
