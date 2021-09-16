use num_traits::ToPrimitive;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use wasm_bindgen::JsValue;

use crate::{
    gear::Gear,
    gear_array::GearArray,
    gear_id,
    types::{ShipAttr, ShipClass, SpeedGroup},
};

use super::{GearTypes, MasterShip};

#[derive(Debug, Default, Clone, Serialize, Deserialize, TS)]
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

#[derive(Debug, Default, Clone, Serialize, Deserialize, TS)]
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

#[derive(Debug, Default, Clone, Serialize, Deserialize, TS)]
pub struct EBonusFnGearInput {
    pub gear_id: u16,
    pub types: GearTypes,

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
    let speed_group = ship.speed_group.unwrap_or_default();

    if ship.has_attr(ShipAttr::Abyssal) || !gears.has(gear_id!("改良型艦本式タービン")) {
        return 0;
    }

    let enhanced_boiler_count = gears.count(gear_id!("強化型艦本式缶"));
    let new_model_boiler_count = gears.count(gear_id!("新型高温高圧缶"));
    let total_boiler_count = enhanced_boiler_count + new_model_boiler_count;

    let synergy = match speed_group {
        SpeedGroup::A => {
            if new_model_boiler_count >= 1 || total_boiler_count >= 2 {
                10
            } else {
                0
            }
        }
        SpeedGroup::B1 => {
            if new_model_boiler_count == 0 {
                0
            } else if total_boiler_count >= 3 {
                15
            } else if total_boiler_count >= 2 {
                10
            } else {
                0
            }
        }
        SpeedGroup::B2 => {
            if new_model_boiler_count >= 2 || total_boiler_count >= 3 {
                10
            } else {
                0
            }
        }
        SpeedGroup::C => {
            if total_boiler_count >= 1 {
                5
            } else {
                0
            }
        }
    };

    if ship.ctype == ShipClass::SentakaType.to_u16().unwrap_or_default()
        && new_model_boiler_count >= 1
    {
        return synergy + 5;
    }

    if synergy == 0 && total_boiler_count >= 1 || ship.has_attr(ShipAttr::TurbineSpeedBonus) {
        5
    } else {
        synergy
    }
}

pub struct EBonusFn(js_sys::Function);

impl EBonusFn {
    pub fn new(js: js_sys::Function) -> Self {
        Self(js)
    }

    fn call_base(&self, ship: &EBonusFnShipInput, gears: &Vec<EBonusFnGearInput>) -> EBonuses {
        self.0
            .call2(
                &JsValue::null(),
                &JsValue::from_serde(ship).unwrap(),
                &JsValue::from_serde(gears).unwrap(),
            )
            .unwrap()
            .into_serde()
            .unwrap()
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
        let ebfn_ship = EBonusFnShipInput::new(ship);
        let ebfn_gears = gears
            .values()
            .map(EBonusFnGearInput::new)
            .collect::<Vec<_>>();

        let mut base = self.call_base(&ebfn_ship, &ebfn_gears);

        let sg_radar_los = if gears.has(gear_id!("SG レーダー(初期型)")) {
            let filtered = ebfn_gears
                .into_iter()
                .filter(|gear| gear.gear_id == gear_id!("SG レーダー(初期型)"))
                .collect::<Vec<_>>();

            self.call_base(&ebfn_ship, &filtered).los
        } else {
            0
        };

        base.effective_los = base.los - sg_radar_los;
        base.carrier_power = self.carrier_power(&ebfn_ship, gears);
        base.speed = get_speed_bonus(ship, gears);

        base
    }
}
