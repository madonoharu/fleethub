#![allow(dead_code)]

mod battle_comp;
mod day_phase;
mod night_phase;
pub mod support_shelling_phase;
mod target_picker;
mod torpedo_phase;

use rand::prelude::*;

use crate::{
    comp::Comp,
    types::{
        AirState, BattleDefinitions, DayCombatRound, EnemyCompType, Engagement, Phase,
        PlayerCompType,
    },
};

pub use battle_comp::*;
use day_phase::DayPhase;
pub use day_phase::DayPhaseAction;
use torpedo_phase::TorpedoPhase;

pub struct Battle<'a, R>
where
    R: Rng + ?Sized,
{
    pub rng: &'a mut R,
    pub battle_defs: BattleDefinitions,
    pub engagement: Engagement,
    pub player_comp: BattleComp,
    pub enemy_comp: BattleComp,
}

impl<'a, R> Battle<'a, R>
where
    R: Rng + ?Sized,
{
    pub fn new(
        rng: &'a mut R,
        battle_defs: BattleDefinitions,
        engagement: Engagement,
        player_comp: Comp,
        enemy_comp: Comp,
    ) -> Self {
        Self {
            rng,
            battle_defs,
            engagement,
            player_comp: BattleComp {
                comp: player_comp,
                formation: Default::default(),
            },
            enemy_comp: BattleComp {
                comp: enemy_comp,
                formation: Default::default(),
            },
        }
    }

    /// unimplemented
    fn try_jet_assault(&mut self) -> anyhow::Result<()> {
        Ok(())
    }

    /// unimplemented
    fn try_aerial_combat(&mut self) -> anyhow::Result<()> {
        Ok(())
    }

    /// unimplemented
    fn try_closing_torpedo_combat(&mut self) -> anyhow::Result<()> {
        TorpedoPhase {
            rng: self.rng,
            battle_defs: &self.battle_defs,
            engagement: self.engagement,
            player_comp: &mut self.player_comp,
            enemy_comp: &mut self.enemy_comp,
        }
        .try_combat()
    }

    fn try_day_phase(&mut self, air_state: AirState, round: DayCombatRound) -> anyhow::Result<()> {
        DayPhase {
            rng: self.rng,
            battle_defs: &self.battle_defs,
            engagement: self.engagement,
            air_state,
            round,
            player_comp: &mut self.player_comp,
            enemy_comp: &mut self.enemy_comp,
        }
        .try_combat()
    }

    pub fn try_battle(&mut self) -> anyhow::Result<()> {
        let player_comp_type = self.player_comp.org_type().try_into()?;
        let enemy_comp_type = self.enemy_comp.org_type().try_into()?;
        let air_state = Default::default();

        let phases = order_phases(player_comp_type, enemy_comp_type);

        phases.into_iter().try_for_each(|phase| match phase {
            Phase::JetAssault => self.try_jet_assault(),
            Phase::AerialCombat => self.try_aerial_combat(),
            Phase::DayCombat(round) => self.try_day_phase(air_state, round),
            Phase::ClosingTorpedo => self.try_closing_torpedo_combat(),
            _ => unimplemented!(),
        })
    }
}

fn order_phases(player: PlayerCompType, enemy: EnemyCompType) -> Vec<Phase> {
    type P = PlayerCompType;
    type E = EnemyCompType;

    match (player, enemy) {
        (P::Single, E::Single) => {
            vec![
                Phase::DayCombat(DayCombatRound::Main1),
                Phase::DayCombat(DayCombatRound::Main2),
                Phase::ClosingTorpedo,
            ]
        }
        (P::CarrierTaskForce | P::TransportEscortForce, E::Single) => {
            vec![
                Phase::DayCombat(DayCombatRound::Escort),
                Phase::ClosingTorpedo,
                Phase::DayCombat(DayCombatRound::Main1),
                Phase::DayCombat(DayCombatRound::Main2),
            ]
        }
        (P::Single, E::Combined) => {
            vec![
                Phase::DayCombat(DayCombatRound::Escort),
                Phase::ClosingTorpedo,
                Phase::DayCombat(DayCombatRound::Main1),
                Phase::DayCombat(DayCombatRound::Main2),
            ]
        }
        (P::CarrierTaskForce | P::TransportEscortForce, E::Combined) => {
            vec![
                Phase::DayCombat(DayCombatRound::Main1),
                Phase::DayCombat(DayCombatRound::Escort),
                Phase::ClosingTorpedo,
                Phase::DayCombat(DayCombatRound::Main2),
            ]
        }
        (P::SurfaceTaskForce, E::Single | E::Combined) => {
            vec![
                Phase::DayCombat(DayCombatRound::Main1),
                Phase::DayCombat(DayCombatRound::Main2),
                Phase::DayCombat(DayCombatRound::Escort),
                Phase::ClosingTorpedo,
            ]
        }
    }
}
