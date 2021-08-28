use enumset::EnumSet;
use num_traits::FromPrimitive;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use crate::{
    gear_id,
    types::{ContactRank, GearAttr, GearState, GearType, GearTypes, MasterGear},
    utils::xxh3,
};

#[derive(Debug)]
enum ProficiencyType {
    Fighter,
    SeaplaneBomber,
    Other,
}

impl ProficiencyType {
    fn fighter_power_ace_modifier(&self, ace: u8) -> i32 {
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
    pub elos: f64,
}

#[wasm_bindgen]
#[derive(Debug, Default, Clone)]
pub struct Gear {
    pub(crate) xxh3: u64,

    #[wasm_bindgen(skip)]
    pub id: String,

    pub gear_id: u16,
    pub exp: u8,
    pub stars: u8,

    #[wasm_bindgen(skip)]
    pub name: String,
    #[wasm_bindgen(skip)]
    pub types: GearTypes,
    #[wasm_bindgen(skip)]
    pub attrs: EnumSet<GearAttr>,
    #[wasm_bindgen(skip)]
    pub ibonuses: IBonuses,
    #[wasm_bindgen(skip)]
    pub gear_type: GearType,
    #[wasm_bindgen(skip)]
    pub special_type: GearType,

    pub max_hp: i16,
    pub firepower: i16,
    pub armor: i16,
    pub torpedo: i16,
    pub anti_air: i16,
    pub speed: i16,
    pub bombing: i16,
    pub asw: i16,
    pub los: i16,
    pub luck: i16,
    pub accuracy: i16,
    pub evasion: i16,
    pub range: u8,
    pub radius: u8,
    pub cost: u8,
    pub improvable: bool,
    pub adjusted_anti_air_resistance: f64,
    pub fleet_anti_air_resistance: f64,
}

impl Gear {
    pub fn new(state: GearState, master: &MasterGear, ibonuses: IBonuses) -> Self {
        let xxh3 = xxh3(&state);

        let gear_type = master.types.gear_type();

        let special_type: GearType = master
            .special_type
            .and_then(FromPrimitive::from_u8)
            .unwrap_or(gear_type);

        let exp = state.exp.unwrap_or_else(|| {
            if master.has_attr(GearAttr::Abyssal) {
                return 0;
            }

            if master.gear_id == gear_id!("二式陸上偵察機(熟練)") {
                return 25;
            }

            match gear_type {
                GearType::CbFighter
                | GearType::CbRecon
                | GearType::ReconSeaplane
                | GearType::SeaplaneFighter
                | GearType::LargeFlyingBoat
                | GearType::JetFighter
                | GearType::JetFighterBomber
                | GearType::JetRecon
                | GearType::JetTorpedoBomber => 120,
                GearType::CbTorpedoBomber
                | GearType::CbDiveBomber
                | GearType::SeaplaneBomber
                | GearType::LbFighter
                | GearType::LbAttacker
                | GearType::LargeLbAircraft => 100,
                _ => 0,
            }
        });

        Gear {
            xxh3,

            id: state.id.unwrap_or_default(),
            gear_id: state.gear_id,
            stars: state.stars.unwrap_or_default(),
            exp,

            gear_type,
            special_type,

            name: master.name.clone(),
            types: master.types.clone(),
            max_hp: master.max_hp.unwrap_or_default(),
            firepower: master.firepower.unwrap_or_default(),
            armor: master.armor.unwrap_or_default(),
            torpedo: master.torpedo.unwrap_or_default(),
            anti_air: master.anti_air.unwrap_or_default(),
            speed: master.speed.unwrap_or_default(),
            bombing: master.bombing.unwrap_or_default(),
            asw: master.asw.unwrap_or_default(),
            los: master.los.unwrap_or_default(),
            luck: master.luck.unwrap_or_default(),
            accuracy: master.accuracy.unwrap_or_default(),
            evasion: master.evasion.unwrap_or_default(),
            range: master.range.unwrap_or_default(),
            radius: master.radius.unwrap_or_default(),
            cost: master.cost.unwrap_or_default(),
            improvable: master.improvable.unwrap_or_default(),
            adjusted_anti_air_resistance: master.adjusted_anti_air_resistance.unwrap_or(1.0),
            fleet_anti_air_resistance: master.fleet_anti_air_resistance.unwrap_or(1.0),

            attrs: master.attrs.clone(),
            ibonuses,
        }
    }

    pub fn has_attr(&self, attr: GearAttr) -> bool {
        self.attrs.contains(attr)
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
    pub fn gear_type(&self) -> String {
        self.gear_type.to_string()
    }

    #[wasm_bindgen(getter)]
    pub fn gear_type_id(&self) -> u8 {
        self.types.gear_type_id()
    }

    #[wasm_bindgen(getter)]
    pub fn special_type_id(&self) -> u8 {
        num_traits::ToPrimitive::to_u8(&self.special_type).unwrap_or_default()
    }

    #[wasm_bindgen(getter)]
    pub fn icon_id(&self) -> u8 {
        self.types.icon_id()
    }

    pub fn discern(&self) -> String {
        use GearType::*;

        let str = match self.gear_type {
            CbFighter => "Fighter",
            CbDiveBomber | CbTorpedoBomber | JetFighterBomber | JetTorpedoBomber => "Bomber",
            CbRecon
            | ReconSeaplane
            | SeaplaneBomber
            | SeaplaneFighter
            | LargeFlyingBoat
            | Autogyro
            | AntiSubPatrolAircraft => "Recon",
            SmallMainGun | MediumMainGun | LargeMainGun => "MainGun",
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
    pub fn ace(&self) -> u8 {
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

    #[wasm_bindgen(getter)]
    pub fn anti_bomber(&self) -> i16 {
        if self.gear_type == GearType::LbFighter {
            self.accuracy
        } else {
            0
        }
    }

    #[wasm_bindgen(getter)]
    pub fn interception(&self) -> i16 {
        if self.gear_type == GearType::LbFighter {
            self.evasion
        } else {
            0
        }
    }

    fn get_proficiency_type(&self) -> ProficiencyType {
        if self.has_attr(GearAttr::Fighter) {
            ProficiencyType::Fighter
        } else if self.gear_type == GearType::SeaplaneBomber {
            ProficiencyType::SeaplaneBomber
        } else {
            ProficiencyType::Other
        }
    }

    pub fn has_proficiency(&self) -> bool {
        self.has_attr(GearAttr::CbAircraft)
            || self.has_attr(GearAttr::Seaplane)
            || self.has_attr(GearAttr::JetAircraft)
            || self.has_attr(GearAttr::LbAircraft)
    }

    fn proficiency_fighter_power_modifier(&self) -> f64 {
        let ace_mod = self
            .get_proficiency_type()
            .fighter_power_ace_modifier(self.ace());

        ace_mod as f64 + (self.exp as f64 / 10.0).sqrt()
    }

    pub fn proficiency_critical_power_mod(&self) -> f64 {
        let ace_bonus = match self.ace() {
            7 => 10.0,
            6 => 7.0,
            5 => 5.0,
            4 => 4.0,
            3 => 3.0,
            2 => 2.0,
            1 => 1.0,
            _ => 0.0,
        };

        ((self.exp as f64).sqrt() + ace_bonus).floor()
    }

    pub fn calc_fighter_power(&self, slot_size: u8) -> i32 {
        let pm = self.proficiency_fighter_power_modifier();

        let multiplier =
            self.anti_air as f64 + 1.5 * (self.interception() as f64) + self.ibonuses.fighter_power;

        (multiplier * (slot_size as f64).sqrt() + pm).floor() as i32
    }

    pub fn calc_interception_power(&self, slot_size: u8) -> i32 {
        let pm = self.proficiency_fighter_power_modifier();

        let multiplier = self.anti_air as f64
            + self.interception() as f64
            + 2.0 * (self.anti_bomber() as f64)
            + self.ibonuses.fighter_power;

        (multiplier * (slot_size as f64).sqrt() + pm).floor() as i32
    }

    pub fn fleet_anti_air(&self) -> f64 {
        if self.anti_air == 0 {
            return 0.;
        }

        let gear_type = self.gear_type;

        let multiplier: f64 = if gear_type == GearType::AntiAirFireDirector
            || self.attrs.contains(GearAttr::HighAngleMount)
        {
            0.35
        } else if gear_type == GearType::AntiAirShell {
            0.6
        } else if self.attrs.contains(GearAttr::Radar) {
            0.4
        } else if self.gear_id == gear_id!("46cm三連装砲") {
            0.25
        } else {
            0.2
        };

        multiplier * (self.anti_air as f64) + self.ibonuses.fleet_anti_air
    }

    pub fn adjusted_anti_air(&self) -> f64 {
        if self.anti_air == 0 {
            return 0.;
        }

        let gear_type = self.gear_type;

        let multiplier = if gear_type == GearType::AntiAirGun {
            6.
        } else if gear_type == GearType::AntiAirFireDirector
            || self.has_attr(GearAttr::HighAngleMount)
        {
            4.
        } else if self.has_attr(GearAttr::Radar) {
            3.
        } else {
            0.
        };

        multiplier * (self.anti_air as f64) + self.ibonuses.adjusted_anti_air
    }

    pub(crate) fn contact_rank(&self) -> ContactRank {
        if self.accuracy <= 1 {
            ContactRank::Rank1
        } else if self.accuracy == 2 {
            ContactRank::Rank2
        } else {
            ContactRank::Rank3
        }
    }

    pub fn calc_contact_trigger_factor(&self, slot_size: u8) -> f64 {
        ((self.los as f64) * (slot_size as f64).sqrt()).floor()
    }

    pub fn is_contact_selection_plane(&self) -> bool {
        self.has_attr(GearAttr::Recon) || self.gear_type == GearType::CbTorpedoBomber
    }

    pub fn contact_selection_rate(&self, air_state_modifier: f64) -> f64 {
        let los = self.los as f64;
        let ibonus = self.ibonuses.contact_selection;

        let value = (los + ibonus).ceil() / (20.0 - 2.0 * air_state_modifier);
        value.min(1.0)
    }

    pub fn night_contact_rate(&self, level: u16) -> f64 {
        let b = (self.los as f64).sqrt() * (level as f64).sqrt();
        let rate = (b.floor() / 25.0).min(1.0);
        rate
    }

    pub fn elos(&self) -> f64 {
        let multiplier = match self.gear_type {
            GearType::CbTorpedoBomber => 0.8,
            GearType::CbRecon => 1.0,
            GearType::ReconSeaplane => 1.2,
            GearType::SeaplaneBomber => 1.1,
            _ => 0.6,
        };

        multiplier * (self.los as f64 + self.ibonuses.elos)
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

        assert_eq!(gear1_pfpm, 5f64.sqrt());
        assert_eq!(
            gear1.calc_fighter_power(5),
            (7.0 * 5f64.sqrt() + gear1_pfpm) as i32
        );

        let gear2 = Gear {
            gear_type: GearType::LbFighter,
            exp: 110,
            anti_air: 2,
            evasion: 3,
            ..Default::default()
        };
        let gear2_pfpm = gear2.proficiency_fighter_power_modifier();
        assert_eq!(gear2_pfpm, 11f64.sqrt());
        assert_eq!(
            gear2.calc_fighter_power(5),
            ((2f64 + 3.0 * 1.5) * 5f64.sqrt() + gear2_pfpm) as i32
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
            gear_type: GearType::LbFighter,
            exp: 110,
            anti_air: 2,
            accuracy: 4,
            evasion: 3,
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
                    assert_eq!(pt.fighter_power_ace_modifier(i as u8), *v)
                });

            [0, 0, 1, 1, 1, 3, 3, 6]
                .iter()
                .enumerate()
                .for_each(|(i, v)| {
                    let pt = ProficiencyType::SeaplaneBomber;
                    assert_eq!(pt.fighter_power_ace_modifier(i as u8), *v)
                });

            assert_eq!(ProficiencyType::Other.fighter_power_ace_modifier(7), 0);
        }
    }
}
