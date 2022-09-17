use std::ops::Deref;

use enumset::EnumSet;
use itertools::Itertools;
use rand::Rng;
use wasm_bindgen::prelude::*;

use crate::{
    fleet::Fleet,
    member::{BattleMemberMut, BattleMemberRef, CompMemberMut, CompMemberRef},
    plane::{Plane, PlaneMut},
    ship::Ship,
    types::{
        AirWaveType, AntiAirCutinDef, BattleDefinitions, CompMeta, FleetType, Formation, OrgType,
        Role, ShipConditions, ShipKey, ShipPosition, Side,
    },
};

#[wasm_bindgen]
#[derive(Debug, Clone)]
pub struct Comp {
    #[wasm_bindgen(readonly)]
    pub org_type: OrgType,
    #[wasm_bindgen(readonly)]
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
    pub fn get_fleet(&self, ft: impl Into<FleetType>) -> Option<&Fleet> {
        Some(match ft.into() {
            FleetType::Main => &self.main,
            FleetType::Escort => self.escort.as_ref()?,
            FleetType::RouteSup => self.route_sup.as_ref()?,
            FleetType::BossSup => self.boss_sup.as_ref()?,
        })
    }

    pub fn get_fleet_mut(&mut self, ft: impl Into<FleetType>) -> Option<&mut Fleet> {
        Some(match ft.into() {
            FleetType::Main => &mut self.main,
            FleetType::Escort => self.escort.as_mut()?,
            FleetType::RouteSup => self.route_sup.as_mut()?,
            FleetType::BossSup => self.boss_sup.as_mut()?,
        })
    }

    pub fn night_fleet_type(&self) -> FleetType {
        if self.is_combined() && self.escort.is_some() {
            FleetType::Escort
        } else {
            FleetType::Main
        }
    }

    pub fn night_fleet(&self) -> &Fleet {
        self.get_fleet(self.night_fleet_type())
            .unwrap_or_else(|| unreachable!())
    }

    pub fn get_battle_member(
        &self,
        formation: Formation,
        position: ShipPosition,
    ) -> Option<BattleMemberRef> {
        let fleet = self.get_fleet(position.fleet_type)?;
        let ship = fleet.ships.get(position.index)?;
        let amagiri_index = fleet.amagiri_index();

        Some(BattleMemberRef::new(
            ship,
            position,
            formation,
            amagiri_index,
        ))
    }

    pub fn get_battle_member_mut(
        &mut self,
        formation: Formation,
        position: ShipPosition,
    ) -> Option<BattleMemberMut> {
        let fleet = self.get_fleet_mut(position.fleet_type)?;
        let amagiri_index = fleet.amagiri_index();
        let ship = fleet.ships.get_mut(position.index)?;

        Some(BattleMemberMut::new(
            ship,
            position,
            formation,
            amagiri_index,
        ))
    }

    pub fn get_battle_member_by_index(
        &self,
        formation: Formation,
        fleet_type: FleetType,
        index: usize,
    ) -> Option<BattleMemberRef> {
        let fleet = self.get_fleet(fleet_type)?;
        let ship = fleet.ships.get(index)?;
        let position = self.get_ship_position(fleet_type, index);
        let amagiri_index = fleet.amagiri_index();

        Some(BattleMemberRef::new(
            ship,
            position,
            formation,
            amagiri_index,
        ))
    }

    fn fleet_entries(
        &self,
        query: impl Into<EnumSet<FleetType>>,
    ) -> impl Iterator<Item = (FleetType, &Fleet)> {
        let query = query.into();
        let Self {
            main,
            escort,
            route_sup,
            boss_sup,
            ..
        } = self;

        let all = [
            (FleetType::Main, Some(main)),
            (FleetType::Escort, escort.as_ref()),
            (FleetType::RouteSup, route_sup.as_ref()),
            (FleetType::BossSup, boss_sup.as_ref()),
        ];

        all.into_iter().filter_map(move |(ft, fleet)| {
            if query.contains(ft) {
                Some((ft, fleet?))
            } else {
                None
            }
        })
    }

    fn fleet_entries_mut(
        &mut self,
        query: impl Into<EnumSet<FleetType>>,
    ) -> impl Iterator<Item = (FleetType, &mut Fleet)> {
        let query = query.into();
        let Self {
            main,
            escort,
            route_sup,
            boss_sup,
            ..
        } = self;

        let all = [
            (FleetType::Main, Some(main)),
            (FleetType::Escort, escort.as_mut()),
            (FleetType::RouteSup, route_sup.as_mut()),
            (FleetType::BossSup, boss_sup.as_mut()),
        ];

        all.into_iter().filter_map(move |(ft, fleet)| {
            if query.contains(ft) {
                Some((ft, fleet?))
            } else {
                None
            }
        })
    }

    pub fn members_by(
        &self,
        query: impl Into<EnumSet<FleetType>>,
    ) -> impl Iterator<Item = CompMemberRef> {
        let org_type = self.org_type;

        self.fleet_entries(query)
            .flat_map(move |(fleet_type, fleet)| {
                let fleet_len = fleet.len;

                fleet.ships.iter().map(move |(index, ship)| CompMemberRef {
                    ship,
                    position: ShipPosition {
                        org_type,
                        fleet_type,
                        fleet_len,
                        index,
                    },
                })
            })
    }

    pub fn members_mut_by(
        &mut self,
        query: impl Into<EnumSet<FleetType>>,
    ) -> impl Iterator<Item = CompMemberMut> {
        let org_type = self.org_type;

        self.fleet_entries_mut(query)
            .flat_map(move |(fleet_type, fleet)| {
                let fleet_len = fleet.len;

                fleet
                    .ships
                    .iter_mut()
                    .map(move |(index, ship)| CompMemberMut {
                        ship,
                        position: ShipPosition {
                            org_type,
                            fleet_type,
                            fleet_len,
                            index,
                        },
                    })
            })
    }

    pub fn all_members(&self) -> impl Iterator<Item = CompMemberRef> {
        self.members_by(EnumSet::all())
    }

    pub fn members_mut(&mut self) -> impl Iterator<Item = CompMemberMut> {
        self.members_mut_by(FleetType::Main | FleetType::Escort)
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
        self.all_members().map(|entry| entry.ship)
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
        battle_defs: &'a BattleDefinitions,
    ) -> Option<&'a AntiAirCutinDef> {
        self.members_by(FleetType::Main | FleetType::Escort)
            .map(|entry| entry.ship)
            .filter_map(|ship| {
                let aaci_vec = ship.get_possible_anti_air_cutin_ids();

                let r = rng.gen_range(0.0..1.0);

                let aaci = aaci_vec
                    .into_iter()
                    .filter_map(|id| battle_defs.anti_air_cutin.get(&id))
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
        if let Some(f) = self.escort.as_mut() {
            f.reset_battle_state()
        }
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

    pub fn has_ship_eid(&self, id: &str) -> bool {
        self.all_members().any(|ship| ship.id == id)
    }

    pub fn first_ship_id(&self) -> Option<String> {
        self.all_members().next().map(|ship| ship.id.clone())
    }

    pub fn has_route_sup(&self) -> bool {
        if let Some(sup) = &self.route_sup {
            sup.ships.values().count() > 0
        } else {
            false
        }
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

    pub fn get_fleet_id(&self, ft: FleetType) -> Option<String> {
        self.get_fleet(ft).map(|f| f.id.clone())
    }

    pub fn get_ship_with_clone(&self, ft: FleetType, key: ShipKey) -> Option<Ship> {
        Some(self.get_fleet(ft)?.ships.get_by_key(key)?.clone())
    }

    pub fn get_ship_entity_id(&self, ft: FleetType, key: ShipKey) -> Option<String> {
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
            .sum::<f64>();

        let post_floor = (total * formation_mod).floor();

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

    pub(crate) fn get_ship_position(&self, fleet_type: FleetType, index: usize) -> ShipPosition {
        ShipPosition {
            org_type: self.org_type,
            fleet_type,
            fleet_len: self.get_fleet(fleet_type).map_or(6, |f| f.len),
            index,
        }
    }

    pub(crate) fn get_amagiri_index(&self, ft: FleetType) -> Option<usize> {
        self.get_fleet(ft)?.amagiri_index()
    }

    pub fn get_ship_conditions(&self, ship: &Ship, formation: Option<Formation>) -> ShipConditions {
        let position = self
            .all_members()
            .find_map(|member| {
                if member.ship == ship {
                    Some(member.position)
                } else {
                    None
                }
            })
            .unwrap_or_default();

        ShipConditions {
            position,
            formation: formation.unwrap_or_else(|| self.org_type.default_formation()),
            amagiri_index: self.get_amagiri_index(position.fleet_type),
        }
    }

    pub fn fleet_los_mod(&self, fleet_type: FleetType) -> Option<f64> {
        self.get_fleet(fleet_type)?.fleet_los_mod()
    }
}

struct FleetTypeQuery(EnumSet<FleetType>);

impl From<FleetType> for FleetTypeQuery {
    #[inline]
    fn from(t: FleetType) -> Self {
        Self(EnumSet::only(t))
    }
}

impl From<EnumSet<FleetType>> for FleetTypeQuery {
    #[inline]
    fn from(set: EnumSet<FleetType>) -> Self {
        Self(set)
    }
}

impl From<Role> for FleetTypeQuery {
    #[inline]
    fn from(role: Role) -> Self {
        FleetType::from(role).into()
    }
}

impl Deref for FleetTypeQuery {
    type Target = EnumSet<FleetType>;
    fn deref(&self) -> &Self::Target {
        &self.0
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
