use super::{
    AttackPower, AttackPowerParams, Damage, DefenseParams, HitRate, HitRateParams, HitType,
};

pub struct Attack {
    pub attack_power: Option<AttackPower>,
    pub hit_rate: Option<HitRate>,
    pub defense_params: Option<DefenseParams>,
    pub is_cutin: bool,
    pub hits: f64,
}

impl Attack {
    pub fn damage(&self, hit_type: HitType, current_hp: u16) -> Option<Damage> {
        let attack_power = self.attack_power.as_ref()?.clone();
        let defense_params = self.defense_params.as_ref()?;

        Some(Damage {
            attack_power,
            defense_params: DefenseParams {
                current_hp,
                max_hp: defense_params.max_hp,
                basic_defense_power: defense_params.basic_defense_power,
                overkill_protection: defense_params.overkill_protection,
                sinkable: defense_params.sinkable,
            },
            hit_type,
            is_cutin: self.is_cutin,
        })
    }
}

pub struct AttackParams {
    pub attack_power_params: Option<AttackPowerParams>,
    pub hit_rate_params: Option<HitRateParams>,
    pub defense_params: Option<DefenseParams>,
    pub is_cutin: bool,
    pub hits: f64,
}

impl AttackParams {
    pub fn into_attack(self) -> Attack {
        let attack_power = self.attack_power_params.map(|p| p.calc());
        let hit_rate = self.hit_rate_params.map(|p| p.calc());

        Attack {
            attack_power,
            hit_rate,
            defense_params: self.defense_params,
            is_cutin: self.is_cutin,
            hits: self.hits,
        }
    }
}
