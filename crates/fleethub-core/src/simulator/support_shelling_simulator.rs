use anyhow::Result;
use rand::prelude::*;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    battle::{support_shelling_phase::SupportShellingPhase, BattleComp},
    types::{BattleDefinitions, Engagement, Formation},
};

use super::{BattleLogger, SimulatorResult};

#[derive(Debug, Serialize, Deserialize, Tsify)]
#[tsify(from_wasm_abi)]
pub struct SupportShellingSimulatorParams {
    #[serde(default)]
    attacker_formation: Formation,
    #[serde(default)]
    target_formation: Formation,
    engagement: Engagement,
}

pub struct SupportShellingSimulator<'a, R>
where
    R: Rng + ?Sized,
{
    phase: SupportShellingPhase<'a, R>,
}

impl<'a, R> SupportShellingSimulator<'a, R>
where
    R: Rng + ?Sized,
{
    pub fn new(
        rng: &'a mut R,
        battle_defs: &'a BattleDefinitions,
        player_comp: &'a mut BattleComp,
        enemy_comp: &'a mut BattleComp,
        engagement: Engagement,
    ) -> Self {
        let phase = SupportShellingPhase {
            rng,
            battle_defs,
            engagement,
            player_comp,
            enemy_comp,
        };

        Self { phase }
    }

    pub fn run(&mut self, times: usize) -> Result<SimulatorResult> {
        let mut logger = BattleLogger::new(times);

        (0..times).try_for_each(|_| -> Result<()> {
            self.phase.try_combat()?;
            logger.write(&self.phase.enemy_comp);
            self.phase.enemy_comp.reset_battle_state();
            Ok(())
        })?;

        Ok(logger.create_result(self.phase.enemy_comp))
    }
}
