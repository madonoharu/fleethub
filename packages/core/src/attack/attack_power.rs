fn apply_modifier(input: f64, a: Option<f64>, b: Option<f64>) -> f64 {
    let mut result = input;

    if let Some(v) = a {
        result = result * v
    }
    if let Some(v) = b {
        result = result + v
    }

    result
}

#[derive(Debug, Default)]
pub struct AttackPowerParams {
    pub basic: f64,
    pub cap: i32,

    // precap modifiers
    pub a12: Option<f64>,
    pub b12: Option<f64>,
    pub a13: Option<f64>,
    pub b13: Option<f64>,
    pub a13next: Option<f64>,
    pub b13next: Option<f64>,
    pub a14: Option<f64>,
    pub b14: Option<f64>,
    pub air_power: Option<f64>,

    // postcap modifiers
    pub a5: Option<f64>,
    pub b5: Option<f64>,
    pub a6: Option<f64>,
    pub b6: Option<f64>,
    pub a11: Option<f64>,
    pub b11: Option<f64>,
    pub ap_shell_modifier: Option<f64>,
    pub proficiency_critical_modifier: Option<f64>,
}

pub struct AttackPower {
    pub precap: f64,
    pub is_capped: bool,
    pub capped: f64,
    pub normal: f64,
    pub critical: f64,
}

impl AttackPowerParams {
    fn apply_precap_modifiers(&self, basic: f64) -> f64 {
        let mut precap = basic;

        precap = apply_modifier(precap, self.a12, self.b12);
        precap = apply_modifier(precap, self.a13, self.b13);
        precap = apply_modifier(precap, self.a13next, self.b13next);

        if let Some(v) = self.air_power {
            precap = ((precap + v) * 1.5).floor() + 25.
        }

        apply_modifier(precap, self.a14, self.b14)
    }

    fn apply_postcap_modifiers(&self, capped: f64) -> (f64, f64) {
        let mut normal = capped;

        normal = apply_modifier(normal, self.a5, self.b5).floor();
        normal = apply_modifier(normal, self.a6, self.b6).floor();
        normal = apply_modifier(normal, self.a11, self.b11);

        if let Some(v) = self.ap_shell_modifier {
            normal = (normal * v).floor()
        }

        let critical = (normal * 1.5 * self.proficiency_critical_modifier.unwrap_or(1.)).floor();

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
