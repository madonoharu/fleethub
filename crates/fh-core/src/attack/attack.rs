use rand::Rng;

use super::{AttackPower, AttackPowerParams, Damage, DefenseParams, HitRate, HitRateParams};

pub struct Attack {
    pub attack_power: Option<AttackPower>,
    pub hit_rate: Option<HitRate>,
    pub defense_params: Option<DefenseParams>,
    pub is_cutin: bool,
    pub hits: f64,
}

impl Attack {
    pub fn gen_damage_value<R: Rng + ?Sized>(&self, rng: &mut R) -> u16 {
        let attack_power = self
            .attack_power
            .as_ref()
            .expect("attack_powerが不明です")
            .clone();
        let defense_params = self
            .defense_params
            .as_ref()
            .expect("defense_paramsが不明です")
            .clone();
        let hit_rate = self.hit_rate.as_ref().expect("hit_rateが不明です");

        let hit_type = hit_rate.gen(rng);

        let damage = Damage {
            attack_power,
            defense_params,
            hit_type,
            is_cutin: self.is_cutin,
        };

        damage.gen(rng)
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
