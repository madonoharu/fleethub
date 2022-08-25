use js_sys::JsString;
use wasm_bindgen::prelude::*;

use crate::{
    air_squadron::AirSquadron,
    comp::Comp,
    fleet::Fleet,
    ship::Ship,
    types::{GearAttr, OrgType, Role, Side},
};

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Org {
    #[wasm_bindgen(getter_with_clone)]
    pub id: String,
    #[wasm_bindgen(readonly)]
    pub hash: u64,

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

    #[wasm_bindgen(readonly)]
    pub hq_level: u8,
    #[wasm_bindgen(readonly)]
    pub org_type: OrgType,
    #[wasm_bindgen(getter_with_clone)]
    pub sortie: String,
    #[wasm_bindgen(getter_with_clone)]
    pub route_sup: Option<String>,
    #[wasm_bindgen(getter_with_clone)]
    pub boss_sup: Option<String>,
}

impl Org {
    pub fn get_fleet_by_role(&self, role: Role) -> &Fleet {
        match role {
            Role::Main => &self.f1,
            Role::Escort => &self.f2,
        }
    }

    pub fn get_fleet_by_key(&self, key: &str) -> &Fleet {
        match key {
            "f1" => &self.f1,
            "f2" => &self.f2,
            "f3" => &self.f3,
            "f4" => &self.f4,
            _ => {
                panic!(r#"get_fleet() argument must be "f1", "f2", "f3" or "f4""#);
            }
        }
    }
}

#[wasm_bindgen]
impl Org {
    pub fn fleet_len(&self, role: Role) -> usize {
        self.get_fleet_by_role(role).len
    }

    pub fn get_ship_entity_id(&self, role: Role, key: &str) -> Option<String> {
        self.get_fleet_by_role(role)
            .ships
            .get_by_key(key)
            .map(|ship| ship.id.clone())
    }

    pub fn air_squadron_ids(&self) -> Vec<JsString> {
        [&self.a1.id, &self.a2.id, &self.a3.id]
            .iter()
            .map(|&id| id.clone().into())
            .collect()
    }

    pub fn fleet_los_mod(&self, role: Role) -> Option<f64> {
        self.get_fleet_by_role(role).fleet_los_mod()
    }

    pub fn main_ship_ids(&self) -> Vec<u16> {
        self.f1.ships.values().map(|ship| ship.ship_id).collect()
    }

    pub fn escort_ship_ids(&self) -> Vec<u16> {
        self.f2.ships.values().map(|ship| ship.ship_id).collect()
    }

    pub fn clone_fleet(&self, key: &str) -> Fleet {
        self.get_fleet_by_key(key).clone()
    }

    pub fn get_ship(&self, role: Role, key: &str) -> Option<Ship> {
        self.get_fleet_by_role(role).get_ship(key)
    }

    pub fn get_ship_by_id(&self, id: &str) -> Option<Ship> {
        let fleets = [&self.f1, &self.f2, &self.f3, &self.f4];

        let ship = fleets
            .iter()
            .find_map(|fleet| fleet.ships.values().find(|ship| ship.eq_id(id)));

        ship.cloned()
    }

    pub fn get_fleet_id_by_role(&self, role: Role) -> String {
        self.get_fleet_by_role(role).id.clone()
    }

    pub fn create_comp(&self) -> Comp {
        self.create_comp_by_key(&self.sortie)
    }

    pub fn create_comp_by_key(&self, key: &str) -> Comp {
        let org_type = self.org_type;
        let enable_escort = org_type.is_combined() && matches!(key, "f1" | "f2");

        let main = if enable_escort {
            &self.f1
        } else {
            self.get_fleet_by_key(key)
        }
        .clone();

        let escort = enable_escort.then(|| self.f2.clone());

        let (route_sup, boss_sup) = if org_type.is_player() {
            let route_sup = self
                .route_sup
                .as_ref()
                .map(|key| self.get_fleet_by_key(key).clone());

            let boss_sup = self
                .boss_sup
                .as_ref()
                .map(|key| self.get_fleet_by_key(key).clone());

            (route_sup, boss_sup)
        } else {
            (None, None)
        };

        Comp {
            hq_level: self.hq_level,
            org_type,
            main,
            escort,
            route_sup,
            boss_sup,
        }
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

    pub fn get_air_squadron_gear_ids_by_improvable(&self) -> Vec<JsString> {
        [&self.a1, &self.a2, &self.a3]
            .iter()
            .flat_map(|air_squadron| air_squadron.gears.values())
            .filter(|gear| gear.improvable)
            .map(|gear| JsString::from(gear.id.clone()))
            .collect()
    }

    pub fn get_air_squadron_gear_ids_by_proficiency(&self) -> Vec<JsString> {
        [&self.a1, &self.a2, &self.a3]
            .iter()
            .flat_map(|air_squadron| air_squadron.gears.values())
            .filter(|gear| gear.has_proficiency())
            .map(|gear| JsString::from(gear.id.clone()))
            .collect()
    }

    pub fn side(&self) -> Side {
        self.org_type.side()
    }

    pub fn is_player(&self) -> bool {
        self.org_type.is_player()
    }

    pub fn is_enemy(&self) -> bool {
        self.org_type.is_enemy()
    }

    pub fn is_single(&self) -> bool {
        self.org_type.is_single()
    }

    pub fn is_combined(&self) -> bool {
        self.org_type.is_combined()
    }

    /// 防空時の基地制空値
    pub fn interception_power(&self) -> i32 {
        let as_vec = [&self.a1, &self.a2, &self.a3]
            .into_iter()
            .filter(|air_squadron| air_squadron.mode.is_air_defense())
            .collect::<Vec<_>>();

        let interception_power = as_vec
            .iter()
            .map(|air_squadron| air_squadron.interception_power())
            .sum::<i32>();

        interception_power
    }

    /// 高高度迎撃時の基地制空値
    pub fn high_altitude_interception_power(&self) -> i32 {
        let as_vec = [&self.a1, &self.a2, &self.a3]
            .into_iter()
            .filter(|air_squadron| air_squadron.mode.is_air_defense())
            .collect::<Vec<_>>();

        let count = as_vec
            .iter()
            .map(|air_squadron| {
                air_squadron
                    .gears
                    .count_attr(GearAttr::HighAltitudeInterceptor)
            })
            .sum::<usize>();

        let modifier = match count {
            0 => 0.5,
            1 => 0.8,
            2 => 1.1,
            _ => 1.2,
        };

        let interception_power = as_vec
            .iter()
            .map(|air_squadron| air_squadron.interception_power())
            .sum::<i32>();

        (interception_power as f64 * modifier).floor() as i32
    }
}

#[wasm_bindgen]
impl Org {
    pub fn default() -> Self {
        Default::default()
    }
}
