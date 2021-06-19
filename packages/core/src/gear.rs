use crate::{const_gear_id, constants::*, master::MasterGear, utils::xxh3};
use num_traits::FromPrimitive;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use wasmer_enumset::EnumSet;

#[derive(Debug, Default, Clone, Hash, Deserialize)]
pub struct GearState {
    #[serde(default)]
    pub id: String,

    pub gear_id: i32,
    #[serde(default)]
    pub exp: i32,
    #[serde(default)]
    pub stars: i32,
}

#[derive(Debug)]
enum ProficiencyType {
    Fighter,
    SeaplaneBomber,
    Other,
}

impl ProficiencyType {
    fn fighter_power_ace_modifier(&self, ace: i32) -> i32 {
        match self {
            ProficiencyType::Fighter => match ace {
                7 => 22,
                6 | 5 => 14,
                4 => 9,
                3 => 5,
                2 => 2,
                _ => 0,
            },
            ProficiencyType::SeaplaneBomber => match ace {
                7 => 6,
                6 | 5 => 3,
                4 | 3 | 2 => 1,
                _ => 0,
            },
            _ => 0,
        }
    }
}

#[wasm_bindgen]
#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct IBonuses {
    pub shelling_power: f64,
    pub shelling_accuracy: f64,
    pub torpedo_power: f64,
    pub torpedo_accuracy: f64,
    pub torpedo_evasion: f64,
    pub asw_power: f64,
    pub asw_accuracy: f64,
    pub night_power: f64,
    pub night_accuracy: f64,
    pub defense_power: f64,
    pub contact_selection: f64,
    pub fighter_power: f64,
    pub adjusted_anti_air: f64,
    pub fleet_anti_air: f64,
    pub effective_los: f64,
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Gear {
    pub(crate) xxh3: u64,

    #[wasm_bindgen(skip)]
    pub id: String,

    pub gear_id: i32,
    pub exp: i32,
    pub stars: i32,

    #[wasm_bindgen(skip)]
    pub name: String,
    #[wasm_bindgen(skip)]
    pub types: [i32; 5],
    #[wasm_bindgen(skip)]
    pub attrs: EnumSet<GearAttr>,
    #[wasm_bindgen(skip)]
    pub ibonuses: IBonuses,

    pub category: GearCategory,
    pub special_type: GearCategory,

    pub max_hp: i32,
    pub firepower: i32,
    pub armor: i32,
    pub torpedo: i32,
    pub anti_air: i32,
    pub speed: i32,
    pub bombing: i32,
    pub asw: i32,
    pub los: i32,
    pub luck: i32,
    pub accuracy: i32,
    pub evasion: i32,
    pub anti_bomber: i32,
    pub interception: i32,
    pub range: i32,
    pub radius: i32,
    pub cost: i32,
    pub improvable: bool,
    pub adjusted_anti_air_resistance: f64,
    pub fleet_anti_air_resistance: f64,
}

impl Gear {
    pub fn new(
        state: GearState,
        master: &MasterGear,
        attrs: EnumSet<GearAttr>,
        ibonuses: IBonuses,
    ) -> Self {
        let xxh3 = xxh3(&state);

        let category: GearCategory = FromPrimitive::from_i32(master.types[2]).unwrap_or_default();

        let special_type: GearCategory = master
            .special_type
            .and_then(FromPrimitive::from_i32)
            .unwrap_or(category);

        let (accuracy, evasion, anti_bomber, interception) = if category == GearCategory::LbFighter
        {
            (0, 0, master.accuracy, master.evasion)
        } else {
            (master.accuracy, master.evasion, 0, 0)
        };

        Gear {
            xxh3,

            id: state.id,
            gear_id: state.gear_id,
            stars: state.stars,
            exp: state.exp,

            category,
            special_type,

            name: master.name.clone(),
            types: master.types,
            max_hp: master.max_hp,
            firepower: master.firepower,
            armor: master.armor,
            torpedo: master.torpedo,
            anti_air: master.anti_air,
            speed: master.speed,
            bombing: master.bombing,
            asw: master.asw,
            los: master.los,
            luck: master.luck,
            accuracy,
            evasion,
            anti_bomber,
            interception,
            range: master.range,
            radius: master.radius,
            cost: master.cost,
            improvable: master.improvable,
            adjusted_anti_air_resistance: master.adjusted_anti_air_resistance,
            fleet_anti_air_resistance: master.fleet_anti_air_resistance,

            attrs,
            ibonuses,
        }
    }
}

#[wasm_bindgen]
impl Gear {
    #[wasm_bindgen(getter)]
    pub fn id(&self) -> String {
        self.id.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn xxh3(&self) -> String {
        format!("{:X}", self.xxh3)
    }

    #[wasm_bindgen(getter)]
    pub fn name(&self) -> String {
        self.name.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn types(&self) -> JsValue {
        JsValue::from_serde(&self.types).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn icon_id(&self) -> i32 {
        self.types[3]
    }

    pub fn has_attr(&self, attr: GearAttr) -> bool {
        self.attrs.contains(attr)
    }

    pub fn discern(&self) -> String {
        use GearCategory::*;

        let str = match self.category {
            CbFighter => "Fighter",
            CbDiveBomber | CbTorpedoBomber | JetFighterBomber | JetTorpedoBomber => "Bomber",
            CbRecon
            | ReconSeaplane
            | SeaplaneBomber
            | SeaplaneFighter
            | Autogyro
            | AntiSubPatrolAircraft => "Recon",
            SmallCaliberMainGun | MediumCaliberMainGun | LargeCaliberMainGun => "MainGun",
            SecondaryGun | AntiAirGun => "Secondary",
            Torpedo | SubmarineTorpedo | MidgetSubmarine => "Torpedo",
            Sonar | LargeSonar | DepthCharge => "AntiSub",
            SmallRadar | LargeRadar => "Radar",
            LandingCraft | SpecialAmphibiousTank | SupplyTransportContainer => "Landing",

            _ => {
                if self.attrs.contains(GearAttr::LbAircraft) {
                    "LandBased"
                } else {
                    "Misc"
                }
            }
        };

        str.to_string()
    }

    #[wasm_bindgen(getter)]
    pub fn ace(&self) -> i32 {
        match self.exp {
            x if x < 10 => 0,
            x if x < 25 => 1,
            x if x < 40 => 2,
            x if x < 55 => 3,
            x if x < 70 => 4,
            x if x < 85 => 5,
            x if x < 100 => 6,
            _ => 7,
        }
    }

    fn get_proficiency_type(&self) -> ProficiencyType {
        if self.attrs.contains(GearAttr::Fighter) {
            ProficiencyType::Fighter
        } else if self.category == GearCategory::SeaplaneBomber {
            ProficiencyType::SeaplaneBomber
        } else {
            ProficiencyType::Other
        }
    }

    pub fn has_proficiency(&self) -> bool {
        self.attrs.contains(GearAttr::CbAircraft)
            || self.attrs.contains(GearAttr::Seaplane)
            || self.attrs.contains(GearAttr::JetAircraft)
            || self.attrs.contains(GearAttr::LbAircraft)
    }

    fn proficiency_fighter_power_modifier(&self) -> f64 {
        let ace_modifier = self
            .get_proficiency_type()
            .fighter_power_ace_modifier(self.ace());

        ace_modifier as f64 + (self.exp as f64).sqrt()
    }

    pub fn calc_fighter_power(&self, slot_size: i32) -> i32 {
        let pm = self.proficiency_fighter_power_modifier();

        let multiplier =
            self.anti_air as f64 + 1.5 * (self.interception as f64) + self.ibonuses.fighter_power;

        (multiplier * (slot_size as f64).sqrt() + pm).floor() as i32
    }

    pub fn calc_interception_power(&self, slot_size: i32) -> i32 {
        let pm = self.proficiency_fighter_power_modifier();

        let multiplier = self.anti_air as f64
            + self.interception as f64
            + 2. * (self.anti_bomber as f64)
            + self.ibonuses.fighter_power;

        (multiplier * (slot_size as f64).sqrt() + pm).floor() as i32
    }

    pub fn fleet_anti_air(&self) -> f64 {
        if self.anti_air == 0 {
            return 0.;
        }

        let category = self.category;

        let multiplier: f64 = if category == GearCategory::AntiAirFireDirector
            || self.attrs.contains(GearAttr::HighAngleMount)
        {
            0.35
        } else if category == GearCategory::AntiAirShell {
            0.6
        } else if self.attrs.contains(GearAttr::Radar) {
            0.4
        } else if self.gear_id == const_gear_id!("46cm三連装砲") {
            0.25
        } else {
            0.2
        };

        multiplier * (self.anti_air as f64) + self.ibonuses.fleet_anti_air
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_gear_state() {
        let state: GearState = serde_json::from_str(r#"{ "gear_id": 1 }"#).unwrap();

        println!("{:#?}", state)
    }

    #[test]
    fn test_calc_fighter_power() {
        let gear1 = Gear {
            exp: 50,
            anti_air: 7,
            ..Default::default()
        };
        let gear1_pfpm = gear1.proficiency_fighter_power_modifier();

        assert_eq!(gear1_pfpm, 50f64.sqrt());
        assert_eq!(
            gear1.calc_fighter_power(5),
            (7. * 5f64.sqrt() + gear1_pfpm) as i32
        );

        let gear2 = Gear {
            exp: 110,
            anti_air: 2,
            interception: 3,
            ..Default::default()
        };
        let gear2_pfpm = gear2.proficiency_fighter_power_modifier();
        assert_eq!(gear2_pfpm, 110f64.sqrt());
        assert_eq!(
            gear2.calc_fighter_power(5),
            ((2f64 + 3. * 1.5) * 5f64.sqrt() + gear2_pfpm) as i32
        )
    }

    #[test]
    fn test_calc_interception_power() {
        let gear1 = Gear {
            exp: 50,
            anti_air: 7,
            ..Default::default()
        };
        let gear1_pfpm = gear1.proficiency_fighter_power_modifier();
        assert_eq!(
            gear1.calc_interception_power(5),
            (7. * 5f64.sqrt() + gear1_pfpm) as i32
        );

        let gear2 = Gear {
            exp: 110,
            anti_air: 2,
            interception: 3,
            anti_bomber: 4,
            ..Default::default()
        };
        let gear2_pfpm = gear2.proficiency_fighter_power_modifier();
        assert_eq!(
            gear2.calc_interception_power(5),
            ((2. + 3. + 4. * 2.) * 5f64.sqrt() + gear2_pfpm) as i32
        )
    }

    #[test]
    fn test_ace() {
        let gear = Gear::default();
        assert_eq!(gear.ace(), 0)
    }

    mod proficiency_type {
        use super::super::ProficiencyType;

        #[test]
        fn test_fighter_power_ace_modifier() {
            [0, 0, 2, 5, 9, 14, 14, 22]
                .iter()
                .enumerate()
                .for_each(|(i, v)| {
                    let pt = ProficiencyType::Fighter;
                    assert_eq!(pt.fighter_power_ace_modifier(i as i32), *v)
                });

            [0, 0, 1, 1, 1, 3, 3, 6]
                .iter()
                .enumerate()
                .for_each(|(i, v)| {
                    let pt = ProficiencyType::SeaplaneBomber;
                    assert_eq!(pt.fighter_power_ace_modifier(i as i32), *v)
                });

            assert_eq!(ProficiencyType::Other.fighter_power_ace_modifier(7), 0);
        }
    }
}
