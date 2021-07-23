use wasm_bindgen::prelude::*;

use crate::{
    air_squadron::AirSquadron,
    array::ShipArray,
    fleet::Fleet,
    ship::Ship,
    types::{OrgType, Role, Side},
};

pub struct MainAndEscortShips<'a> {
    count: usize,
    is_combined: bool,
    main_ships: &'a ShipArray,
    escort_ships: &'a ShipArray,
}

impl<'a> Iterator for MainAndEscortShips<'a> {
    type Item = (Role, usize, &'a Ship);

    fn next(&mut self) -> Option<Self::Item> {
        let count = self.count;
        self.count += 1;

        let (role, index, ships) = if count < ShipArray::CAPACITY {
            (Role::Main, count, self.main_ships)
        } else if self.is_combined && count < ShipArray::CAPACITY * 2 {
            (Role::Escort, count - ShipArray::CAPACITY, self.escort_ships)
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
#[derive(Debug, Default, Clone)]
pub struct Org {
    #[wasm_bindgen(skip)]
    pub xxh3: u64,

    #[wasm_bindgen(skip)]
    pub id: String,

    #[wasm_bindgen(skip)]
    pub f1: Fleet,
    #[wasm_bindgen(skip)]
    pub f2: Fleet,
    #[wasm_bindgen(skip)]
    pub f3: Fleet,
    #[wasm_bindgen(skip)]
    pub f4: Fleet,

    #[wasm_bindgen(skip)]
    pub a1: AirSquadron,
    #[wasm_bindgen(skip)]
    pub a2: AirSquadron,
    #[wasm_bindgen(skip)]
    pub a3: AirSquadron,

    pub hq_level: i32,

    #[wasm_bindgen(skip)]
    pub org_type: OrgType,

    #[wasm_bindgen(skip)]
    pub side: Side,
}

impl Org {
    pub fn main(&self) -> &Fleet {
        &self.f1
    }

    pub fn escort(&self) -> &Fleet {
        &self.f2
    }

    pub fn night_fleet(&self) -> &Fleet {
        if self.is_combined() {
            self.escort()
        } else {
            self.main()
        }
    }

    pub fn main_and_escort_ships(&self) -> MainAndEscortShips {
        MainAndEscortShips {
            count: 0,
            is_combined: self.is_combined(),
            main_ships: &self.main().ships,
            escort_ships: &self.escort().ships,
        }
    }
}

#[wasm_bindgen]
impl Org {
    #[wasm_bindgen(getter)]
    pub fn xxh3(&self) -> String {
        format!("{:X}", self.xxh3)
    }

    #[wasm_bindgen(getter)]
    pub fn id(&self) -> String {
        self.id.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn org_type(&self) -> String {
        self.org_type.to_string()
    }

    pub fn get_fleet(&self, key: &str) -> Result<Fleet, JsValue> {
        let fleet = match key {
            "f1" => &self.f1,
            "f2" => &self.f2,
            "f3" => &self.f3,
            "f4" => &self.f4,
            _ => {
                return Err(JsValue::from_str(
                    r#"get_fleet() argument must be "f1", "f2", "f3" or "f4""#,
                ))
            }
        };

        Ok(fleet.clone())
    }

    pub fn get_air_squadron(&self, key: &str) -> Result<AirSquadron, JsValue> {
        let air_squadron = match key {
            "a1" => &self.a1,
            "a2" => &self.a2,
            "a3" => &self.a3,
            _ => {
                return Err(JsValue::from_str(
                    r#"get_air_squadron() argument must be "a1", "a2" or "a3""#,
                ))
            }
        };

        Ok(air_squadron.clone())
    }

    pub fn is_combined(&self) -> bool {
        self.org_type.is_combined()
    }

    pub fn fleet_anti_air(&self, formation_mod: f64) -> f64 {
        let total = self
            .main_and_escort_ships()
            .map(|(_, _, ship)| ship.fleet_anti_air())
            .sum::<i32>() as f64;

        let post_floor = (total * formation_mod).floor() * 2.;

        if self.side.is_player() {
            post_floor / 1.3
        } else {
            post_floor
        }
    }

    pub fn transport_point(&self) -> i32 {
        self.main_and_escort_ships()
            .map(|(_, _, ship)| ship.transport_point())
            .sum()
    }
}
