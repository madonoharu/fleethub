use rand::prelude::*;

use crate::{
    attack::SupportShellingAttackParams,
    battle::target_picker::TargetPicker,
    error::SHIP_NOT_FOUND,
    types::{BattleDefinitions, Engagement, FleetType, ShipPosition, SupportShellingType},
};

use super::battle_comp::BattleComp;

pub struct SupportShellingPhase<'a, R>
where
    R: Rng + ?Sized,
{
    pub rng: &'a mut R,
    pub battle_defs: &'a BattleDefinitions,
    pub engagement: Engagement,
    pub player_comp: &'a mut BattleComp,
    pub enemy_comp: &'a mut BattleComp,
}

impl<'a, R> SupportShellingPhase<'a, R>
where
    R: Rng + ?Sized,
{
    pub fn try_combat(&mut self) -> anyhow::Result<()> {
        #[allow(clippy::needless_collect)]
        let order = self
            .player_comp
            .members_by(FleetType::RouteSup)
            .map(|ship| ship.position)
            .collect::<Vec<_>>();

        order
            .into_iter()
            .try_for_each(|attacker_position| self.try_attack(attacker_position))
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

        let mut picker =
            TargetPicker::<SupportShellingType>::new(self.battle_defs, &attacker, target_comp);

        let picked = if let Some(picked) = picker.choose(self.rng) {
            picked
        } else {
            return Ok(());
        };

        let attack_type = picked.attack_type;
        let mut target = target_comp
            .get_ship_mut(picked.position)
            .expect(SHIP_NOT_FOUND);

        let formation_params = self.battle_defs.get_formation_params(
            attack_type,
            attacker.conditions(),
            target.conditions(),
        );

        SupportShellingAttackParams {
            attack_type,
            engagement,
            attacker: &attacker,
            target: &target.as_ref(),
            formation_params,
        }
        .to_attack()
        .apply(self.rng, &mut target)
    }
}
