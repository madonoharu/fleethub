use rand::prelude::Distribution;

use crate::ship::Ship;

use super::{AttackPower, AttackPowerParams, Damage, DefenseParams, HitRate, HitRateParams};

pub struct Attack {
    pub attack_power: Option<AttackPower>,
    pub hit_rate: Option<HitRate>,
    pub defense_params: Option<DefenseParams>,
    pub is_cutin: bool,
    pub hits: f64,
}

impl Attack {
    fn gen_damage_value<R: rand::Rng + ?Sized>(&self, rng: &mut R) -> anyhow::Result<u16> {
        use anyhow::Context;

        let attack_power = self
            .attack_power
            .as_ref()
            .context("attack_powerが不明です")?;
        let defense_params = self
            .defense_params
            .as_ref()
            .context("defense_paramsが不明です")?;
        let hit_rate = self.hit_rate.as_ref().context("hit_rateが不明です")?;

        let hit_type = hit_rate.sample(rng);

        let damage = Damage {
            hit_type,
            attack_term: attack_power.get_attack_term(hit_type),
            remaining_ammo_mod: attack_power.remaining_ammo_mod,
            current_hp: defense_params.current_hp,
            basic_defense_power: defense_params.basic_defense_power,
            overkill_protection: defense_params.overkill_protection,
            sinkable: defense_params.sinkable,
            is_cutin: self.is_cutin,
        };

        Ok(damage.sample(rng))
    }

    pub fn apply<R: rand::Rng + ?Sized>(
        &self,
        rng: &mut R,
        target: &mut Ship,
    ) -> anyhow::Result<()> {
        let value = self.gen_damage_value(rng)?;
        target.take_damage(value);
        Ok(())
    }
}

#[derive(Debug)]
pub struct AttackParams {
    pub attack_power_params: Option<AttackPowerParams>,
    pub hit_rate_params: Option<HitRateParams>,
    pub defense_params: Option<DefenseParams>,
    pub is_cutin: bool,
    pub hits: f64,
}

impl AttackParams {
    pub fn calc_attack_power(&self) -> Option<AttackPower> {
        self.attack_power_params.as_ref().map(|p| p.calc())
    }

    pub fn calc_hit_rate(&self) -> Option<HitRate> {
        self.hit_rate_params.as_ref().map(|p| p.calc())
    }

    pub fn calc_attack(&self) -> Attack {
        Attack {
            attack_power: self.calc_attack_power(),
            hit_rate: self.calc_hit_rate(),
            defense_params: self.defense_params.clone(),
            is_cutin: self.is_cutin,
            hits: self.hits,
        }
    }

    pub fn into_attack(self) -> Attack {
        Attack {
            attack_power: self.calc_attack_power(),
            hit_rate: self.calc_hit_rate(),
            defense_params: self.defense_params,
            is_cutin: self.is_cutin,
            hits: self.hits,
        }
    }
}
