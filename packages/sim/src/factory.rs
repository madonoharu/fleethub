use crate::master::MasterData;
use crate::{constants::GearCategory, gear::Gear};
use num_traits::FromPrimitive;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Debug, Default, Clone, Deserialize)]
pub struct GearState {
    pub gear_id: i32,
    pub exp: Option<i32>,
    pub stars: Option<i32>,
}

#[wasm_bindgen]
struct Factory {
    master_data: MasterData,
}

#[wasm_bindgen]
impl Factory {
    #[wasm_bindgen(constructor)]
    pub fn new(js: JsValue) -> Self {
        let master_data: MasterData = js.into_serde().unwrap();
        Self { master_data }
    }

    fn create_gear(&self, state: GearState) -> Option<Gear> {
        let gear_id = state.gear_id;
        let stars = state.stars.unwrap_or_default();
        let exp = state.exp.unwrap_or_default();

        self.master_data
            .gears
            .iter()
            .find(|mg| mg.gear_id == gear_id)
            .map(|mg| {
                let attrs = self.master_data.find_gear_attrs(mg);
                let ibonuses = self.master_data.get_ibonuses(mg, stars);

                Gear {
                    gear_id,
                    stars,
                    exp,

                    category: FromPrimitive::from_i32(mg.types[2]).unwrap_or_default(),

                    name: mg.name.to_string(),
                    types: mg.types,
                    max_hp: mg.max_hp.unwrap_or_default(),
                    firepower: mg.firepower.unwrap_or_default(),
                    armor: mg.armor.unwrap_or_default(),
                    torpedo: mg.torpedo.unwrap_or_default(),
                    anti_air: mg.anti_air.unwrap_or_default(),
                    speed: mg.speed.unwrap_or_default(),
                    bombing: mg.bombing.unwrap_or_default(),
                    asw: mg.asw.unwrap_or_default(),
                    los: mg.los.unwrap_or_default(),
                    luck: mg.luck.unwrap_or_default(),
                    accuracy: mg.accuracy.unwrap_or_default(),
                    evasion: mg.evasion.unwrap_or_default(),
                    anti_bomber: mg.anti_bomber.unwrap_or_default(),
                    interception: mg.interception.unwrap_or_default(),
                    range: mg.range.unwrap_or_default(),
                    radius: mg.radius.unwrap_or_default(),
                    cost: mg.cost.unwrap_or_default(),
                    improvable: mg.improvable.unwrap_or_default(),
                    adjusted_anti_air_resistance: mg
                        .adjusted_anti_air_resistance
                        .unwrap_or_default(),
                    fleet_anti_air_resistance: mg.fleet_anti_air_resistance.unwrap_or_default(),

                    attrs,
                    ibonuses,
                }
            })
    }

    pub fn create_gear_by_js(&self, js: JsValue) -> Option<Gear> {
        let state: GearState = match js.into_serde() {
            Ok(s) => s,
            Err(_) => return None,
        };

        self.create_gear(state)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    #[test]
    fn test_create_gear() {
        let master_data = crate::master::get_master_data();
        let factory = Factory { master_data };
        let state: GearState = serde_json::from_str(r#"{ "gear_id": 1 }"#).unwrap();

        let gear = factory.create_gear(state);
        assert_eq!(gear.unwrap().name, "12cm単装砲".to_string());
    }

    macro_rules! measure {
        ( $x:expr) => {{
            let start = std::time::Instant::now();
            let result = $x;
            let end = start.elapsed();
            println!(
                "計測開始から{}.{:03}秒経過しました。",
                end.as_secs(),
                end.subsec_nanos() / 1_000_000
            );
            result
        }};
    }

    #[test]
    fn benche_create_gear() {
        let master_data = crate::master::get_master_data();
        let factory = Factory { master_data };

        measure! {
            for n in 0..=1_000_000 {
                let _ = factory.master_data.gears.iter().map(|g| GearState { gear_id: g.gear_id, stars: None, exp:None }).map(|g| factory.create_gear(g));
             }
        }
    }
}
