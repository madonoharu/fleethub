use crate::{
    attack::WarfareShipEnvironment,
    fleet::{Fleet, ShipArray},
    ship::Ship,
    types::{Formation, OrgType, Role},
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
pub struct Comp<'a> {
    pub org_type: OrgType,
    pub main: &'a Fleet,
    pub escort: Option<&'a Fleet>,
}

impl<'a> Comp<'a> {
    pub fn is_combined(&self) -> bool {
        self.escort.is_some()
    }

    pub fn night_fleet(&self) -> &'a Fleet {
        self.escort.unwrap_or(self.main)
    }

    pub fn ships(&self) -> CompShips<'a> {
        CompShips {
            count: 0,
            main_ships: &self.main.ships,
            escort_ships: self.escort.map(|f| &f.ships),
        }
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
            Role::Main => self.main,
            Role::Escort => self.escort.unwrap_or_else(|| unreachable!()),
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
            let escort_fp = self.escort?.fighter_power(anti_lbas)?;
            Some(main_fp + escort_fp)
        }
    }

    /// マップ索敵
    pub fn elos(&self, hq_level: u8, node_divaricated_factor: u8) -> Option<f64> {
        let main_elos = self.main.elos(hq_level, node_divaricated_factor)?;

        if let Some(escort) = self.escort {
            let escort_elos = escort.elos(hq_level, node_divaricated_factor)?;
            Some(main_elos + escort_elos)
        } else {
            Some(main_elos)
        }
    }
}
