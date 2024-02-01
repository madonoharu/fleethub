mod airstrike;
mod anti_pt_imp_modifiers;
mod asw_attack;
mod attack_params;
mod attack_power;
mod damage;
mod day_phase_attack;
mod fleet_cutin;
mod hit_rate;
mod landing_craft_modifiers;
mod night_phase_attack;
mod shelling_attack;
mod support_shelling_attack;
mod torpedo_attack;

pub use airstrike::*;
pub use asw_attack::*;
pub use attack_params::*;
pub use attack_power::*;
pub use damage::*;
pub use day_phase_attack::*;
pub use fleet_cutin::*;
pub use hit_rate::*;
pub use landing_craft_modifiers::*;
pub use night_phase_attack::*;
pub use shelling_attack::*;
pub use support_shelling_attack::*;
pub use torpedo_attack::*;

trait AttackTrait {
    fn calc_attack_params(&self) -> AttackParams;

    fn try_apply<R: rand::Rng + ?Sized>(
        &self,
        rng: &mut R,
        target: &mut crate::ship::Ship,
    ) -> anyhow::Result<()> {
        use anyhow::Context;
        use rand::prelude::*;

        let attack_params = self.calc_attack_params();

        let is_cutin = attack_params.is_cutin();
        let attack_power = attack_params.attack_power_params.context("context")?.calc();
        let hit_rate = attack_params.hit_rate_params.context("context")?.calc();
        let defense_params = attack_params.defense_params.context("context")?;

        let hit_type = hit_rate.sample(rng);

        let damage = damage::Damage::new(hit_type, attack_power, defense_params, is_cutin);

        let value = damage.sample(rng);
        target.take_damage(value);
        Ok(())
    }
}
