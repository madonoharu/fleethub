use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
pub struct AttackPowerModifier {
    pub a: f64,
    pub b: f64,
}

impl Default for AttackPowerModifier {
    fn default() -> Self {
        Self { a: 1.0, b: 0.0 }
    }
}

impl From<(f64, f64)> for AttackPowerModifier {
    #[inline]
    fn from((a, b): (f64, f64)) -> Self {
        Self { a, b }
    }
}

impl AttackPowerModifier {
    pub fn new(a: f64, b: f64) -> Self {
        Self { a, b }
    }

    pub fn set(&mut self, a: f64, b: f64) {
        self.a = a;
        self.b = b;
    }

    pub fn compose(&self, other: &Self) -> Self {
        Self {
            a: self.a * other.a,
            b: self.b + other.b,
        }
    }

    pub fn merge(&mut self, a: f64, b: f64) {
        self.a *= a;
        self.b += b;
    }

    #[inline]
    pub fn apply(&self, v: f64) -> f64 {
        self.a * v + self.b
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
pub struct SpecialEnemyModifiers {
    pub precap_general_mod: AttackPowerModifier,
    pub stype_mod: AttackPowerModifier,
    pub landing_craft_synergy_mod: AttackPowerModifier,
    pub toku_daihatsu_tank_mod: AttackPowerModifier,
    pub m4a1dd_mod: AttackPowerModifier,
    pub honi_mod: AttackPowerModifier,
    pub postcap_general_mod: AttackPowerModifier,
    pub pt_mod: AttackPowerModifier,
}

impl SpecialEnemyModifiers {
    pub fn new() -> Self {
        Self::default()
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
pub struct CustomModifiers {
    pub precap_mod: AttackPowerModifier,
    pub postcap_mod: AttackPowerModifier,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
pub struct AttackPowerParams {
    pub basic: f64,
    pub cap: f64,
    pub precap_mod: AttackPowerModifier,
    pub postcap_mod: AttackPowerModifier,
    pub ap_shell_mod: Option<f64>,
    pub carrier_power: Option<f64>,
    pub proficiency_critical_mod: Option<f64>,
    pub armor_penetration: f64,
    pub remaining_ammo_mod: f64,
    pub special_enemy_mods: SpecialEnemyModifiers,
    pub custom_mods: CustomModifiers,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
pub struct AttackPower {
    pub precap: f64,
    pub is_capped: bool,
    pub capped: f64,
    pub normal: f64,
    pub critical: f64,
    pub armor_penetration: f64,
    pub remaining_ammo_mod: f64,
}

impl AttackPowerParams {
    fn apply_precap_mods(&self, basic: f64) -> f64 {
        let mut precap = basic;

        let SpecialEnemyModifiers {
            precap_general_mod,
            stype_mod,
            landing_craft_synergy_mod,
            toku_daihatsu_tank_mod,
            m4a1dd_mod,
            honi_mod,
            ..
        } = &self.special_enemy_mods;

        precap = stype_mod.apply(precap);
        precap *= precap_general_mod.a;
        precap = toku_daihatsu_tank_mod.apply(precap);
        precap = m4a1dd_mod.apply(precap);
        precap = honi_mod.apply(precap);
        precap = landing_craft_synergy_mod.apply(precap);
        precap += precap_general_mod.b;

        if let Some(v) = self.carrier_power {
            precap = ((precap + v) * 1.5).floor() + 25.0
        }

        let precap_mod = self.precap_mod.compose(&self.custom_mods.precap_mod);

        precap_mod.apply(precap)
    }

    fn apply_postcap_mods(&self, capped: f64) -> (f64, f64) {
        let mut postcap = capped.floor();

        let SpecialEnemyModifiers {
            postcap_general_mod,
            pt_mod,
            ..
        } = &self.special_enemy_mods;

        postcap = postcap_general_mod.apply(postcap).floor();
        postcap = pt_mod.apply(postcap).floor();

        let postcap_mod = self.postcap_mod.compose(&self.custom_mods.postcap_mod);

        postcap = postcap_mod.apply(postcap);

        if let Some(v) = self.ap_shell_mod {
            postcap = (postcap * v).floor()
        }

        let normal = postcap;
        let critical = (normal * 1.5 * self.proficiency_critical_mod.unwrap_or(1.0)).floor();

        return (normal, critical);
    }

    pub fn calc(&self) -> AttackPower {
        let cap = self.cap;
        let precap = self.apply_precap_mods(self.basic);

        let is_capped = precap > cap;

        let capped = if is_capped {
            cap + (precap - cap).sqrt()
        } else {
            precap
        };

        let (normal, critical) = self.apply_postcap_mods(capped);

        AttackPower {
            precap,
            is_capped,
            capped,
            normal,
            critical,
            armor_penetration: self.armor_penetration,
            remaining_ammo_mod: self.remaining_ammo_mod,
        }
    }
}
