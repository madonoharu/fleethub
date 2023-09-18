#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

use crate::{
    gear::Gear,
    gear_array::GearArray,
    master_data::MasterShip,
    types::{ctype, gear_id, ShipAttr, SpeedGroup},
};

use super::GearTypeIdArray;

#[wasm_bindgen(module = "equipment-bonus")]
extern "C" {
    #[wasm_bindgen(js_name = createEquipmentBonuses)]
    fn create_equipment_bonuses(ship: ShipInput, gears: GearVecInput) -> EBonuses;
}

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
    pub speed: u8,
    #[serde(skip_deserializing)]
    pub aerial_power: i16,
}

#[derive(Debug, Default, Clone, Serialize, Tsify)]
#[tsify(into_wasm_abi)]
struct ShipInput {
    pub ship_id: u16,
    pub ctype: u16,
    pub stype: u8,
    pub yomi: String,
}

impl ShipInput {
    pub fn new(ship: &MasterShip) -> Self {
        Self {
            ship_id: ship.ship_id,
            yomi: ship.yomi.clone(),
            stype: ship.stype,
            ctype: ship.ctype,
        }
    }
}

#[derive(Debug, Default, Clone, Serialize, Tsify)]
struct GearInput {
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

impl GearInput {
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

#[derive(Debug, Default, Clone, Serialize, Tsify)]
#[tsify(into_wasm_abi)]
struct GearVecInput(Vec<GearInput>);

fn get_speed_bonus(ship: &MasterShip, gears: &GearArray) -> u8 {
    if ship.is_abyssal() {
        return 0;
    }

    let base = match ship.speed {
        5 => BaseSpeed::Slow,
        10 => BaseSpeed::Fast,
        _ => return 0,
    };

    let speed_group = ship.speed_group;
    let has_turbine = gears.has(gear_id!("改良型艦本式タービン"));
    let new_model_boiler_count = gears.count(gear_id!("新型高温高圧缶"));

    let enhanced_boiler_count = gears.count(gear_id!("強化型艦本式缶"));
    let improved_new_model_boiler_count =
        gears.count_by(|gear| gear.gear_id == gear_id!("新型高温高圧缶") && gear.stars >= 7);

    let synergy = get_speed_synergy(
        base,
        speed_group,
        has_turbine,
        enhanced_boiler_count,
        new_model_boiler_count,
        improved_new_model_boiler_count,
    );

    let turbine_bonus = if synergy == 0 && has_turbine && ship.has_attr(ShipAttr::TurbineSpeedBonus)
    {
        5
    } else {
        0
    };

    // 新型高温高圧缶補正
    let new_model_boiler_mod = if new_model_boiler_count >= 1
        && (ship.ctype == ctype!("潜高型")
            || (ship.ctype == ctype!("鳳翔型") && ship.remodel_rank() >= 6))
    {
        5
    } else {
        0
    };

    new_model_boiler_mod + turbine_bonus + synergy
}

#[derive(Debug)]
enum BaseSpeed {
    Slow,
    Fast,
}

fn get_speed_synergy(
    base: BaseSpeed,
    group: SpeedGroup,
    has_turbine: bool,
    enhanced_boiler_count: usize,
    new_model_boiler_count: usize,
    improved_new_model_boiler_count: usize,
) -> u8 {
    let total_boiler_count = enhanced_boiler_count + new_model_boiler_count;

    match (base, group) {
        (BaseSpeed::Fast, SpeedGroup::A) => {
            if has_turbine {
                if new_model_boiler_count >= 1 || total_boiler_count >= 2 {
                    10
                } else if total_boiler_count >= 1 {
                    5
                } else {
                    0
                }
            } else {
                match improved_new_model_boiler_count {
                    2.. => 10,
                    1 => 5,
                    _ => 0,
                }
            }
        }
        (BaseSpeed::Slow, SpeedGroup::A) => {
            if has_turbine {
                if new_model_boiler_count >= 1 {
                    if total_boiler_count >= 3 || improved_new_model_boiler_count >= 2 {
                        15
                    } else if total_boiler_count >= 2 || improved_new_model_boiler_count >= 1 {
                        10
                    } else {
                        5
                    }
                } else if total_boiler_count >= 1 {
                    5
                } else {
                    0
                }
            } else {
                0
            }
        }
        (_, SpeedGroup::B1) => {
            if has_turbine {
                if new_model_boiler_count >= 1 && total_boiler_count >= 2 {
                    10
                } else if total_boiler_count >= 1 {
                    5
                } else {
                    0
                }
            } else {
                0
            }
        }
        (_, SpeedGroup::B2) => {
            if has_turbine {
                if new_model_boiler_count >= 2 || total_boiler_count >= 3 {
                    10
                } else if total_boiler_count >= 1 {
                    5
                } else {
                    0
                }
            } else {
                0
            }
        }
        (_, SpeedGroup::C) => {
            if has_turbine && total_boiler_count >= 1 {
                5
            } else {
                0
            }
        }
    }
}

fn get_aerial_power(ship: &MasterShip, gears: &GearArray) -> i16 {
    let ship_input = ShipInput::new(ship);

    let plane_bonuses = gears
        .values()
        .filter(|gear| gear.has_proficiency())
        .map(|gear| {
            let gears_input = GearVecInput(vec![GearInput::new(gear)]);
            create_equipment_bonuses(ship_input.clone(), gears_input)
        })
        .collect::<Vec<_>>();

    let min_torpedo = plane_bonuses
        .iter()
        .map(|ebonus| ebonus.torpedo)
        .filter(|v| *v > 0)
        .min()
        .unwrap_or_default();

    let min_bombing = plane_bonuses
        .iter()
        .map(|ebonus| ebonus.bombing)
        .filter(|v| *v > 0)
        .min()
        .unwrap_or_default();

    let other = gears
        .values()
        .filter(|gear| !gear.has_proficiency())
        .map(GearInput::new)
        .collect::<Vec<_>>();

    let other_bonus = create_equipment_bonuses(ship_input, GearVecInput(other));

    min_torpedo + min_bombing + other_bonus.torpedo + other_bonus.bombing
}

impl EBonuses {
    #[cfg(target_arch = "wasm32")]
    pub fn new(ship: &MasterShip, gears: &GearArray) -> Self {
        let ship_input = ShipInput::new(ship);
        let gears_input = GearVecInput(gears.values().map(GearInput::new).collect::<Vec<_>>());

        let mut ebonuses = create_equipment_bonuses(ship_input, gears_input);
        ebonuses.aerial_power = get_aerial_power(ship, gears);
        ebonuses.speed = get_speed_bonus(ship, gears);

        ebonuses
    }

    #[cfg(not(target_arch = "wasm32"))]
    pub fn new(ship: &MasterShip, gears: &GearArray) -> Self {
        let ship_input = ShipInput::new(ship);
        let gears_input = GearVecInput(gears.values().map(GearInput::new).collect::<Vec<_>>());

        let ship_json = serde_json::to_string(&ship_input).unwrap();
        let gears_json = serde_json::to_string(&gears_input).unwrap();

        let code = format!(
            r#"
                const {{ createEquipmentBonuses }} = require("equipment-bonus");
                const result = createEquipmentBonuses({ship_json}, {gears_json});
                console.log(JSON.stringify(result));
            "#
        );

        let stdout = std::process::Command::new("node")
            .arg("-e")
            .arg(code)
            .output()
            .unwrap()
            .stdout;

        serde_json::from_slice(&stdout).unwrap()
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_speed_synergy() {
        use BaseSpeed::*;
        use SpeedGroup::*;

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
            ($base: ident, $group: ident, $has_t: expr, $e_count: expr, $n_count: expr, $in_count: expr, $expected: ident) => {
                let synergy = get_speed_synergy(
                    $base,
                    $group,
                    $has_t,
                    $e_count,
                    $n_count + $in_count,
                    $in_count,
                );

                let base_value = match $base {
                    Fast => 10,
                    Slow => 5,
                };
                let expected_value = speed_value!($expected) - base_value;

                assert_eq!(
                    synergy,
                    expected_value,
                    "{:?}",
                    ($base, $group, $has_t, $e_count, $n_count, $in_count)
                )
            };
        }

        macro_rules! test_table {
            ($has_t: expr, $n_count: expr, $in_count: expr, $e_count: expr, $fa: ident, $fb1: ident, $fb2: ident, $fc: ident, $sa: ident, $sb: ident, $sc: ident) => {
                test_item!(Fast, A, $has_t, $e_count, $n_count, $in_count, $fa);
                test_item!(Fast, B1, $has_t, $e_count, $n_count, $in_count, $fb1);
                test_item!(Fast, B2, $has_t, $e_count, $n_count, $in_count, $fb2);
                test_item!(Fast, C, $has_t, $e_count, $n_count, $in_count, $fc);
                test_item!(Slow, A, $has_t, $e_count, $n_count, $in_count, $sa);
                test_item!(Slow, B2, $has_t, $e_count, $n_count, $in_count, $sb);
                test_item!(Slow, C, $has_t, $e_count, $n_count, $in_count, $sc);
            };
        }

        test_table!(false, 0, 1, 0, 高速P, 高速, 高速, 高速, 低速, 低速, 低速);
        test_table!(false, 0, 2, 0, 最速, 高速, 高速, 高速, 低速, 低速, 低速);

        test_table!(true, 0, 0, 1, 高速P, 高速P, 高速P, 高速P, 高速, 高速, 高速);
        test_table!(true, 0, 0, 2, 最速, 高速P, 高速P, 高速P, 高速, 高速, 高速);
        test_table!(true, 0, 0, 3, 最速, 高速P, 最速, 高速P, 高速, 高速P, 高速);
        test_table!(true, 0, 0, 4, 最速, 高速P, 最速, 高速P, 高速, 高速P, 高速);
        test_table!(true, 1, 0, 0, 最速, 高速P, 高速P, 高速P, 高速, 高速, 高速);
        test_table!(true, 0, 1, 0, 最速, 高速P, 高速P, 高速P, 高速P, 高速, 高速);
        test_table!(true, 1, 0, 1, 最速, 最速, 高速P, 高速P, 高速P, 高速, 高速);
        test_table!(true, 1, 0, 2, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
        test_table!(true, 1, 0, 3, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
        test_table!(true, 2, 0, 0, 最速, 最速, 最速, 高速P, 高速P, 高速P, 高速);
        test_table!(true, 0, 2, 0, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
        test_table!(true, 2, 0, 1, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
        test_table!(true, 2, 0, 2, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
        test_table!(true, 3, 0, 0, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
        test_table!(true, 3, 0, 1, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
        test_table!(true, 4, 0, 0, 最速, 最速, 最速, 高速P, 最速, 高速P, 高速);
    }
}
