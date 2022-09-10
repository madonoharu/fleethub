use js_sys::JsString;
use serde::Serialize;
use tsify::Tsify;
use wasm_bindgen::prelude::*;

use crate::{
    air_squadron::AirSquadron,
    comp::Comp,
    fleet::Fleet,
    ship::Ship,
    types::{FleetKey, FleetType, GearAttr, OrgType, ShipKey, Side},
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
    #[wasm_bindgen(readonly)]
    pub sortie: FleetKey,
    #[wasm_bindgen(readonly)]
    pub route_sup: Option<FleetKey>,
    #[wasm_bindgen(readonly)]
    pub boss_sup: Option<FleetKey>,
}

impl Org {
    pub fn get_fleet(&self, key: FleetKey) -> &Fleet {
        match key {
            FleetKey::F1 => &self.f1,
            FleetKey::F2 => &self.f2,
            FleetKey::F3 => &self.f3,
            FleetKey::F4 => &self.f4,
        }
    }

    pub fn get_ship(&self, fleet_key: FleetKey, ship_key: ShipKey) -> Option<&Ship> {
        self.get_fleet(fleet_key).ships.get_by_key(ship_key)
    }
}

#[wasm_bindgen]
impl Org {
    pub fn first_ship_id(&self) -> Option<String> {
        [&self.f1, &self.f2, &self.f3, &self.f4]
            .iter()
            .flat_map(|fleet| fleet.ships.values())
            .find_map(|ship| Some(ship.id.clone()))
    }

    pub fn get_ship_mid(&self, fleet_key: FleetKey, ship_key: ShipKey) -> Option<u16> {
        self.get_ship(fleet_key, ship_key).map(|ship| ship.ship_id)
    }

    pub fn get_ship_eid(&self, fleet_key: FleetKey, ship_key: ShipKey) -> Option<String> {
        self.get_ship(fleet_key, ship_key)
            .map(|ship| ship.id.clone())
    }

    pub fn get_fleet_id(&self, key: FleetKey) -> String {
        self.get_fleet(key).id.clone()
    }

    pub fn air_squadron_ids(&self) -> Vec<JsString> {
        [&self.a1.id, &self.a2.id, &self.a3.id]
            .iter()
            .map(|&id| id.clone().into())
            .collect()
    }

    pub fn main_ship_ids(&self) -> Vec<u16> {
        self.f1.ships.values().map(|ship| ship.ship_id).collect()
    }

    pub fn escort_ship_ids(&self) -> Vec<u16> {
        self.f2.ships.values().map(|ship| ship.ship_id).collect()
    }

    pub fn clone_fleet(&self, key: FleetKey) -> Fleet {
        self.get_fleet(key).clone()
    }

    pub fn clone_ship(&self, fleet_key: FleetKey, ship_key: ShipKey) -> Option<Ship> {
        self.get_ship(fleet_key, ship_key).cloned()
    }

    pub fn get_ship_by_id(&self, id: &str) -> Option<Ship> {
        let fleets = [&self.f1, &self.f2, &self.f3, &self.f4];

        let ship = fleets
            .iter()
            .find_map(|fleet| fleet.ships.values().find(|ship| ship.eq_id(id)));

        ship.cloned()
    }

    pub fn ship_keys(&self, key: FleetKey) -> Vec<JsString> {
        self.get_fleet(key).ship_keys()
    }

    pub fn create_comp(&self) -> Comp {
        self.create_comp_by_key(self.sortie)
    }

    pub fn create_comp_by_key(&self, key: FleetKey) -> Comp {
        let org_type = self.org_type;
        let enable_escort = org_type.is_combined() && matches!(key, FleetKey::F1 | FleetKey::F2);

        let main = if enable_escort {
            &self.f1
        } else {
            self.get_fleet(key)
        }
        .clone();

        let escort = enable_escort.then(|| self.f2.clone());

        let (route_sup, boss_sup) = if org_type.is_player() {
            let route_sup = self.route_sup.map(|key| self.get_fleet(key).clone());
            let boss_sup = self.boss_sup.map(|key| self.get_fleet(key).clone());

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

    pub fn create_move_ship_payload(&self, id: &str, x: i8, y: i8) -> Option<MoveShipPayload> {
        let (current_fleet_key, current_index) = FleetKey::iter().find_map(|key| {
            let fleet = self.get_fleet(key);
            let (index, _) = fleet.ships.iter().find(|(_, s)| s.id == id)?;
            Some((key, index))
        })?;

        let target_fleet_key = match x {
            1 => current_fleet_key.next(),
            -1 => current_fleet_key.next_back(),
            _ => current_fleet_key,
        };

        let target_fleet = self.get_fleet(target_fleet_key);

        if current_index >= target_fleet.len {
            return None;
        }

        let target_ship_key: ShipKey = num_traits::FromPrimitive::from_i8(
            (current_index as i8 + y).rem_euclid(target_fleet.len as i8),
        )
        .unwrap_or_default();

        let current_fleet_id = self.get_fleet(current_fleet_key).id.clone();
        let current_ship_key = ShipKey::from(current_index);
        let target_fleet_id = target_fleet.id.clone();
        let target_ship_id = target_fleet
            .ships
            .get_by_key(target_ship_key)
            .map(|ship| ship.id.clone());

        Some(MoveShipPayload {
            current: (id.to_string(), current_fleet_id, current_ship_key),
            target: (target_ship_id, target_fleet_id, target_ship_key),
        })
    }

    pub fn get_fleet_type(&self, key: FleetKey) -> Option<FleetType> {
        if self.sortie == key {
            Some(FleetType::Main)
        } else if self.is_combined() && key == FleetKey::F2 {
            Some(FleetType::Escort)
        } else if self.route_sup == Some(key) {
            Some(FleetType::RouteSup)
        } else if self.boss_sup == Some(key) {
            Some(FleetType::BossSup)
        } else {
            None
        }
    }
}

#[derive(Debug, Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct MoveShipPayload {
    current: (String, String, ShipKey),
    target: (Option<String>, String, ShipKey),
}
