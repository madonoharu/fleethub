use std::ops::Add;

use paste::paste;
use serde::Serialize;
use ts_rs::TS;

macro_rules! declare_attack_power_modifiers {
    (($( $an:ident ),* $(,)?) , ($( $bn:ident ),* $(,)?)) => {
        #[derive(Debug, Clone)]
        pub struct AttackPowerModifiers {
            $( pub $an: f64, pub $bn: f64 ),*
        }

        impl Default for AttackPowerModifiers {
            fn default() -> Self {
                Self {
                    $( $an: 1.0, $bn: 0.0 ),*
                }
            }
        }

        impl AttackPowerModifiers {
            paste! {
                $(
                    pub fn [<apply_ $an>](&mut self, v: f64) {
                        self.$an *= v;
                    }

                    pub fn [<apply_ $bn>](&mut self, v: f64) {
                        self.$bn += v;
                    }
                )*
            }
        }

        impl Add for AttackPowerModifiers {
            type Output = Self;

            fn add(self, rhs: Self) -> Self::Output {
                let mut out = Self::default();

                Self {
                    $(
                        $an: self.$an * rhs.$an,
                        $bn: self.$bn + rhs.$bn,
                    )*
                }
            }
        }
    };
}

declare_attack_power_modifiers!(
    (a5, a6, a7, a11, a12, a13, a13_2, a14),
    (b5, b6, b7, b11, b12, b13, b13_2, b14)
);

#[derive(Debug, Default, Clone)]
pub struct AttackPowerParams {
    pub basic: f64,
    pub cap: i32,
    pub mods: AttackPowerModifiers,
    pub ap_shell_mod: Option<f64>,
    pub air_power: Option<f64>,
    pub proficiency_critical_mod: Option<f64>,
}

#[derive(Debug, Serialize, TS)]
pub struct AttackPower {
    pub precap: f64,
    pub is_capped: bool,
    pub capped: f64,
    pub normal: f64,
    pub critical: f64,
}

impl AttackPowerParams {
    fn apply_precap_modifiers(&self, basic: f64) -> f64 {
        let mods = &self.mods;
        let mut precap = basic;

        precap = precap * mods.a12 + mods.b12;
        precap = precap * mods.a13 + mods.b13;
        precap = precap * mods.a13_2 + mods.b13_2;

        if let Some(v) = self.air_power {
            precap = ((precap + v) * 1.5).floor() + 25.
        }

        precap * mods.a14 + mods.b14
    }

    fn apply_postcap_modifiers(&self, capped: f64) -> (f64, f64) {
        let mods = &self.mods;
        let mut normal = capped;

        normal = (normal * mods.a5 + mods.b5).floor();
        normal = (normal * mods.a6 + mods.b6).floor();
        normal = (normal * mods.a7 + mods.b7).floor();
        normal = normal * mods.a11 + mods.b11;

        if let Some(v) = self.ap_shell_mod {
            normal = (normal * v).floor()
        }

        let critical = (normal * 1.5 * self.proficiency_critical_mod.unwrap_or(1.)).floor();

        return (normal, critical);
    }

    pub fn calc(&self) -> AttackPower {
        let precap = self.apply_precap_modifiers(self.basic);

        let capf64 = self.cap as f64;
        let is_capped = precap > (capf64);

        let capped = if is_capped {
            capf64 + (precap - capf64).sqrt()
        } else {
            precap
        };

        let (normal, critical) = self.apply_postcap_modifiers(capped);

        AttackPower {
            precap,
            is_capped,
            capped,
            normal,
            critical,
        }
    }
}
