use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::JsValue;

use crate::{
    gear::Gear,
    gear_array::GearArray,
    types::{ctype, gear_id, ShipAttr, SpeedGroup},
};

use super::{GearTypeIdArray, MasterShip};

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct EBonuses {
    pub firepower: i16,
    pub torpedo: i16,
    pub anti_air: i16,
    pub armor: i16,
    pub evasion: i16,
    pub asw: i16,
    pub los: i16,
    pub bombing: i16,
    pub accuracy: i16,
    pub range: i8,

    #[serde(skip_deserializing)]
    pub effective_los: i16,
    #[serde(skip_deserializing)]
    pub speed: u8,
    #[serde(skip_deserializing)]
    pub carrier_power: i16,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct EBonusFnShipInput {
    pub ship_id: u16,
    pub ctype: u16,
    pub stype: u8,
    pub yomi: String,
}

impl EBonusFnShipInput {
    pub fn new(ship: &MasterShip) -> Self {
        Self {
            ship_id: ship.ship_id,
            yomi: ship.yomi.clone(),
            stype: ship.stype,
            ctype: ship.ctype,
        }
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct EBonusFnGearInput {
    pub gear_id: u16,
    pub types: GearTypeIdArray,

    pub firepower: i16,
    pub torpedo: i16,
    pub anti_air: i16,
    pub armor: i16,
    pub evasion: i16,
    pub asw: i16,
    pub los: i16,
    pub bombing: i16,
    pub accuracy: i16,
    pub range: u8,
    pub radius: u8,

    pub stars: u8,
    pub ace: u8,
}

impl EBonusFnGearInput {
    pub fn new(gear: &Gear) -> Self {
        Self {
            gear_id: gear.gear_id,
            types: gear.types.clone(),

            firepower: gear.firepower,
            torpedo: gear.torpedo,
            anti_air: gear.anti_air,
            armor: gear.armor,
            evasion: gear.evasion,
            asw: gear.asw,
            los: gear.los,
            bombing: gear.bombing,
            accuracy: gear.accuracy,
            range: gear.range,
            radius: gear.radius,

            stars: gear.stars,
            ace: gear.ace(),
        }
    }
}

fn get_speed_bonus(ship: &MasterShip, gears: &GearArray) -> u8 {
    let base = match ship.speed {
        5 => BaseSpeed::Slow,
        10 => BaseSpeed::Fast,
        _ => return 0,
    };

    let speed_group = ship.speed_group.unwrap_or_default();
    let new_model_boiler_count = gears.count(gear_id!("新型高温高圧缶"));

    // 新型高速潜水艦補正
    let sentaka_type_mod = if ship.ctype == ctype!("潜高型") && new_model_boiler_count >= 1 {
        5
    } else {
        0
    };

    if ship.has_attr(ShipAttr::Abyssal) || !gears.has(gear_id!("改良型艦本式タービン")) {
        return sentaka_type_mod;
    }

    let enhanced_boiler_count = gears.count(gear_id!("強化型艦本式缶"));

    let synergy = get_speed_synergy(
        base,
        speed_group,
        enhanced_boiler_count,
        new_model_boiler_count,
    );

    let turbine_bonus = if synergy == 0 && ship.has_attr(ShipAttr::TurbineSpeedBonus) {
        5
    } else {
        0
    };

    sentaka_type_mod + turbine_bonus + synergy
}

#[derive(Debug)]
enum BaseSpeed {
    Slow,
    Fast,
}

fn get_speed_synergy(
    base: BaseSpeed,
    group: SpeedGroup,
    enhanced_boiler_count: usize,
    new_model_boiler_count: usize,
) -> u8 {
    let total_boiler_count = enhanced_boiler_count + new_model_boiler_count;

    match (base, group) {
        (BaseSpeed::Fast, SpeedGroup::A) => {
            if new_model_boiler_count >= 1 || total_boiler_count >= 2 {
                10
            } else if total_boiler_count >= 1 {
                5
            } else {
                0
            }
        }
        (BaseSpeed::Slow, SpeedGroup::A) => {
            if new_model_boiler_count >= 1 {
                if total_boiler_count >= 3 {
                    15
                } else if total_boiler_count >= 2 {
                    10
                } else {
                    5
                }
            } else if total_boiler_count >= 1 {
                5
            } else {
                0
            }
        }
        (_, SpeedGroup::B1) => {
            if new_model_boiler_count >= 1 && total_boiler_count >= 2 {
                10
            } else if total_boiler_count >= 1 {
                5
            } else {
                0
            }
        }
        (_, SpeedGroup::B2) => {
            if new_model_boiler_count >= 2 || total_boiler_count >= 3 {
                10
            } else if total_boiler_count >= 1 {
                5
            } else {
                0
            }
        }
        (_, SpeedGroup::C) => {
            if total_boiler_count >= 1 {
                5
            } else {
                0
            }
        }
    }
}

pub struct EBonusFn {
    pub js: Option<js_sys::Function>,
}

impl EBonusFn {
    pub fn new(js: js_sys::Function) -> Self {
        Self { js: Some(js) }
    }

    fn call_base(&self, ship: &EBonusFnShipInput, gears: &Vec<EBonusFnGearInput>) -> EBonuses {
        self.js
            .as_ref()
            .map(|f| {
                f.call2(
                    &JsValue::null(),
                    &JsValue::from_serde(ship).unwrap(),
                    &JsValue::from_serde(gears).unwrap(),
                )
                .unwrap()
                .into_serde()
                .unwrap()
            })
            .unwrap_or_default()
    }

    fn carrier_power(&self, ship: &EBonusFnShipInput, gears: &GearArray) -> i16 {
        let min_air_torpedo_bonus = gears
            .values()
            .filter(|gear| gear.has_proficiency())
            .map(|gear| {
                let torpedo = self
                    .call_base(ship, &vec![EBonusFnGearInput::new(gear)])
                    .torpedo;
                torpedo
            })
            .filter(|v| *v > 0)
            .min();

        min_air_torpedo_bonus.unwrap_or_default()
    }

    pub fn call(&self, ship: &MasterShip, gears: &GearArray) -> EBonuses {
        let ship_input = EBonusFnShipInput::new(ship);
        let gear_inputs = gears
            .values()
            .map(EBonusFnGearInput::new)
            .collect::<Vec<_>>();

        let mut base = self.call_base(&ship_input, &gear_inputs);

        let sg_radar_los = if gears.has(gear_id!("SG レーダー(初期型)")) {
            let filtered = gear_inputs
                .into_iter()
                .filter(|gear| gear.gear_id == gear_id!("SG レーダー(初期型)"))
                .collect::<Vec<_>>();

            self.call_base(&ship_input, &filtered).los
        } else {
            0
        };

        base.effective_los = base.los - sg_radar_los;
        base.carrier_power = self.carrier_power(&ship_input, gears);
        base.speed = get_speed_bonus(ship, gears);

        base
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_speed_synergy() {
        use BaseSpeed::*;
        use SpeedGroup::*;
        get_speed_synergy(BaseSpeed::Slow, SpeedGroup::A, 0, 0);

        macro_rules! speed_value {
            (低速) => {
                5
            };
            (高速) => {
                10
            };
            (高速P) => {
                15
            };
            (最速) => {
                20
            };
        }

        macro_rules! test_item {
            ($base: ident, $group: ident, $e_count: expr, $n_count: expr, $expected: ident) => {
                let synergy = get_speed_synergy($base, $group, $e_count, $n_count);
                let base_value = match $base {
                    Fast => 10,
                    Slow => 5,
                };
                let expected_value = speed_value!($expected) - base_value;

                assert_eq!(
                    synergy,
                    expected_value,
                    "{:?}",
                    ($n_count, $e_count, $base, $group)
                )
            };
        }

        macro_rules! test_table {
            ($n_count: expr, $e_count: expr, $fa: ident, $fb1: ident, $fb2: ident, $fc: ident, $sa: ident, $sb: ident, $sc: ident) => {
                test_item!(Fast, A, $e_count, $n_count, $fa);
                test_item!(Fast, B1, $e_count, $n_count, $fb1);
                test_item!(Fast, B2, $e_count, $n_count, $fb2);
                test_item!(Fast, C, $e_count, $n_count, $fc);
                test_item!(Slow, A, $e_count, $n_count, $sa);
                test_item!(Slow, B2, $e_count, $n_count, $sb);
                test_item!(Slow, C, $e_count, $n_count, $sc);
            };
        }

        test_table!(0, 1, 高速P, 高速P, 高速P, 高速P, 高速, 高速, 高速);
        test_table!(0, 2, 最速, 高速P, 高速P, 高速P, 高速, 高速, 高速);
        test_table!(0, 3, 最速, 高速P, 最速, 高速P, 高速, 高速P, 高速);
        test_table!(0, 4, 最速, 高速P, 最速, 高速P, 高速, 高速P, 高速);
        test_table!(1, 0, 最速, 高速P, 高速P, 高速P, 高速, 高速, 高速);
        test_table!(1, 1, 最速, 最速, 高速P, 高速P, 高速P, 高速, 高速);
        test_table!(1, 2, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
        test_table!(1, 3, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
        test_table!(2, 0, 最速, 最速, 最速, 高速P, 高速P, 高速P, 高速);
        test_table!(2, 1, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
        test_table!(2, 2, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
        test_table!(3, 0, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
        test_table!(3, 1, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
        test_table!(4, 0, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
    }
}
