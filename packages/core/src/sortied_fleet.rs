use crate::{
    fleet::{Fleet, ShipArray},
    ship::Ship,
    types::Role,
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
    pub main: &'a Fleet,
    pub escort: Option<&'a Fleet>,
}

impl<'a> SortiedFleet<'a> {
    pub fn is_combined(&self) -> bool {
        self.escort.is_some()
    }

    pub fn ships(&self) -> SortiedFleetShips<'a> {
        SortiedFleetShips {
            count: 0,
            main_ships: &self.main.ships,
            escort_ships: self.escort.map(|f| &f.ships),
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
