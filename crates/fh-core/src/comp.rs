use wasm_bindgen::prelude::*;

use crate::{
    attack::WarfareShipEnvironment,
    fleet::{Fleet, ShipArray},
    ship::Ship,
    types::{CompMeta, FleetType, Formation, OrgType, Role},
};

pub struct CompShips<'a> {
    count: usize,
    main_ships: &'a ShipArray,
    escort_ships: Option<&'a ShipArray>,
}

impl<'a> Iterator for CompShips<'a> {
    type Item = (Role, usize, &'a Ship);

    fn next(&mut self) -> Option<Self::Item> {
        let count = self.count;
        self.count += 1;

        let (role, index, ships) = if count < ShipArray::CAPACITY {
            (Role::Main, count, self.main_ships)
        } else if count < ShipArray::CAPACITY * 2 {
            if let Some(escort_ships) = self.escort_ships {
                (Role::Escort, count - ShipArray::CAPACITY, escort_ships)
            } else {
                return None;
            }
        } else {
            return None;
        };

        if let Some(ship) = ships.get(index) {
            Some((role, index, ship))
        } else {
            self.next()
        }
    }
}

#[wasm_bindgen]
pub struct Comp {
    pub org_type: OrgType,
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

    pub fn ships(&self) -> CompShips {
        CompShips {
            count: 0,
            main_ships: &self.main.ships,
            escort_ships: self.escort.as_ref().map(|f| &f.ships),
        }
    }

    pub fn reset_battle_state(&mut self) {
        self.main.reset_battle_state();
        self.escort.as_mut().map(|f| f.reset_battle_state());
    }

    pub fn create_warfare_ship_environment(
        &self,
        ship: &Ship,
        formation: Formation,
    ) -> WarfareShipEnvironment {
        let (role, ship_index) = self
            .ships()
            .find_map(|(role, index, current)| (ship == current).then(|| (role, index)))
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

    /// 艦隊対空値
    pub fn fleet_anti_air(&self, formation_mod: f64) -> f64 {
        let total = self
            .ships()
            .map(|(_, _, ship)| ship.fleet_anti_air())
            .sum::<i32>() as f64;

        let post_floor = (total * formation_mod).floor() * 2.;

        if self.org_type.side().is_player() {
            post_floor / 1.3
        } else {
            post_floor
        }
    }

    /// 制空値
    pub fn fighter_power(&self, anti_combined: bool, anti_lbas: bool) -> Option<i32> {
        let main_fp = self.main.fighter_power(anti_lbas)?;

        if !anti_combined {
            Some(main_fp)
        } else {
            let escort_fp = self.escort.as_ref()?.fighter_power(anti_lbas)?;
            Some(main_fp + escort_fp)
        }
    }

    /// マップ索敵
    pub fn elos(&self, hq_level: u8, node_divaricated_factor: u8) -> Option<f64> {
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
        self.ships()
            .map(|(_, _, ship)| ship.transport_point())
            .sum()
    }
}

#[wasm_bindgen]
impl Comp {
    pub fn is_combined(&self) -> bool {
        self.escort.is_some()
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
        self.ships()
            .find_map(|(_, _, ship)| (ship.id == id).then(|| ship))
            .cloned()
    }
}

#[cfg(test)]
mod test {
    use crate::comp::Comp;

    #[test]
    fn test() {
        println!("{}", std::mem::size_of::<Box<Comp>>());
    }
}
