use crate::{
    fleet::{Fleet, ShipArray},
    ship::Ship,
    types::{OrgType, Role},
};

pub struct SortiedFleetShips<'a> {
    count: usize,
    main_ships: &'a ShipArray,
    escort_ships: Option<&'a ShipArray>,
}

impl<'a> Iterator for SortiedFleetShips<'a> {
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
pub struct SortiedFleet<'a> {
    pub org_type: OrgType,
    pub main: &'a Fleet,
    pub escort: Option<&'a Fleet>,
}

impl<'a> SortiedFleet<'a> {
    pub fn is_combined(&self) -> bool {
        self.org_type.is_combined()
    }

    pub fn ships(&self) -> SortiedFleetShips<'a> {
        SortiedFleetShips {
            count: 0,
            main_ships: &self.main.ships,
            escort_ships: self.escort.map(|f| &f.ships),
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

        if !self.is_combined() || !anti_combined {
            Some(main_fp)
        } else {
            let escort_fp = self.escort?.fighter_power(anti_lbas)?;
            Some(main_fp + escort_fp)
        }
    }

    /// マップ索敵
    pub fn elos(&self, hq_level: u8, node_divaricated_factor: u8) -> Option<f64> {
        let main_elos = self.main.elos(hq_level, node_divaricated_factor)?;

        if !self.is_combined() {
            return Some(main_elos);
        }

        if let Some(escort) = self.escort {
            let escort_elos = escort.elos(hq_level, node_divaricated_factor)?;
            Some(main_elos + escort_elos)
        } else {
            None
        }
    }
}
