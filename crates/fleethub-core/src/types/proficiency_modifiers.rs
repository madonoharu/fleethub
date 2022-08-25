#[derive(Debug, Clone, Copy)]
pub struct ProficiencyModifiers {
    pub hit_percentage_bonus: f64,
    pub critical_power_mod: f64,
    pub critical_percentage_bonus: f64,
}

impl Default for ProficiencyModifiers {
    fn default() -> Self {
        Self {
            hit_percentage_bonus: 0.0,
            critical_power_mod: 1.0,
            critical_percentage_bonus: 0.0,
        }
    }
}
