use crate::{
    ship::Ship,
    types::{gear_id, AttackType, GearType},
};

pub struct AntiPtImpAccuracyModifiers {
    pub additive: f64,
    pub multiplicative: f64,
    pub ship_type_mod: f64,
    pub equipment_mod: f64,
    pub night_mod: f64,
}

impl Default for AntiPtImpAccuracyModifiers {
    fn default() -> Self {
        Self {
            additive: 0.0,
            multiplicative: 1.0,
            ship_type_mod: 1.0,
            equipment_mod: 1.0,
            night_mod: 1.0,
        }
    }
}

impl AntiPtImpAccuracyModifiers {
    pub fn new(attacker: &Ship, target: &Ship, attack_type: impl Into<AttackType>) -> Self {
        if !target.is_pt_imp() {
            return Default::default();
        }

        let attack_type = attack_type.into();
        let multiplicative = 0.42;
        let additive = 24.0;

        if attack_type.is_torpedo() {
            return Self {
                additive,
                multiplicative,
                ..Default::default()
            };
        }

        let ship_type_mod = if attacker.ship_type.is_destroyer() {
            1.0
        } else if attacker.ship_type.is_light_cruiser() {
            0.82
        } else {
            0.7
        };

        let gears = &attacker.gears;

        let small_gun_count = attacker.gears.count_type(GearType::SmallMainGun);
        let aa_gun_count = attacker.gears.count_type(GearType::AntiAirGun);
        let has_ship_personnel = attacker.gears.has_type(GearType::ShipPersonnel);
        let has_sec_gun = attacker.gears.has_type(GearType::SecondaryGun);
        let ab_count = gears.count(gear_id!("装甲艇(AB艇)"));
        let armed_count = gears.count(gear_id!("武装大発"));
        let armored_boat_group_count = ab_count + armed_count;
        let cb_bomber_count = gears.count_type(GearType::CbDiveBomber);

        let equipment_mod = {
            let mut v = 1.0;

            if small_gun_count >= 1 {
                v *= 1.3
            }
            if small_gun_count >= 2 {
                v *= 1.15
            }
            if aa_gun_count >= 1 {
                v *= 1.45;
            }
            if aa_gun_count >= 2 {
                v *= 1.35;
            }
            if has_ship_personnel {
                v *= 1.75;
            }
            if has_sec_gun {
                v *= 1.55;
            }
            if armored_boat_group_count >= 1 {
                v *= 1.45;
            }
            if armored_boat_group_count >= 2 {
                v *= 1.3;
            }
            if gears.has_type(GearType::SeaplaneBomber) || gears.has_type(GearType::SeaplaneFighter)
            {
                v *= 1.5;
            }
            if cb_bomber_count >= 1 {
                v *= 1.38;
            }
            if cb_bomber_count >= 2 {
                v *= 1.2;
            }

            v
        };

        let night_mod = if attack_type.is_night() { 0.7 } else { 1.0 };

        Self {
            multiplicative: 0.42,
            additive: 24.0,
            ship_type_mod,
            equipment_mod,
            night_mod,
        }
    }
}
