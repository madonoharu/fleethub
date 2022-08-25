use rand::prelude::*;

use crate::{
    attack::TorpedoAttackParams,
    battle::target_picker::TargetPicker,
    error::SHIP_NOT_FOUND,
    types::{
        AttackType, BattleDefinitions, Engagement, Participant, ShipPosition, TorpedoAttackType,
    },
};

use super::battle_comp::BattleComp;

pub struct TorpedoPhase<'a, R>
where
    R: Rng + ?Sized,
{
    pub rng: &'a mut R,
    pub battle_defs: &'a BattleDefinitions,
    pub engagement: Engagement,
    pub player_comp: &'a mut BattleComp,
    pub enemy_comp: &'a mut BattleComp,
}

impl<'a, R> TorpedoPhase<'a, R>
where
    R: Rng + ?Sized,
{
    pub fn try_combat(&mut self) -> anyhow::Result<()> {
        let player = self.player_comp.members(Participant::Escort);
        let enemy = self.enemy_comp.members(Participant::Escort);

        player
            .chain(enemy)
            .map(|ship| ship.position)
            .collect::<Vec<_>>()
            .into_iter()
            .try_for_each(|attacker_position| self.try_attack(attacker_position))
    }

    fn target_participant(&self) -> Participant {
        if self.enemy_comp.comp.is_combined() {
            Participant::Both
        } else {
            Participant::Escort
        }
    }

    fn try_attack(&mut self, attacker_position: ShipPosition) -> anyhow::Result<()> {
        let attacker_side = attacker_position.side();
        let engagement = self.engagement;

        let (attacker_comp, target_comp) = if attacker_side.is_player() {
            (&self.player_comp, &mut self.enemy_comp)
        } else {
            (&self.enemy_comp, &mut self.player_comp)
        };

        let attacker = attacker_comp
            .get_ship(attacker_position)
            .expect(SHIP_NOT_FOUND);

        let mut picker = TargetPicker::<TorpedoAttackType>::new(
            self.battle_defs,
            target_comp,
            Participant::Both,
        );

        let picked = picker.choose(self.rng);
        let mut target = if let Some(t) = picked {
            target_comp.get_ship_mut(t.position).expect(SHIP_NOT_FOUND)
        } else {
            return Ok(());
        };

        let formation_params = self.battle_defs.get_formation_params(
            AttackType::Torpedo,
            attacker.conditions(),
            target.conditions(),
        );

        let attack = TorpedoAttackParams {
            attacker: &attacker,
            target: &target.as_ref(),
            engagement,
            formation_params,
        }
        .to_attack();

        attack.apply(self.rng, &mut target)
    }
}
