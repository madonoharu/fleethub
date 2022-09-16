use rand::prelude::*;

use crate::{
    attack::NightPhaseAttackParams,
    error::SHIP_NOT_FOUND,
    ship::NightCutinTermParams,
    types::{
        AirState, BattleDefinitions, Engagement, NightAttackStyle, NightConditions,
        NightPhaseAttackStyle, NightPhaseAttackType, NodeState, Participant, ShipPosition,
    },
    utils::some_or_return,
};

use super::{battle_comp::BattleComp, target_picker::TargetPicker};

pub struct NightPhase<'a, R>
where
    R: Rng + ?Sized,
{
    pub rng: &'a mut R,
    pub battle_defs: &'a BattleDefinitions,
    pub node_state: NodeState,
    pub engagement: Engagement,
    pub air_state: AirState,
    pub player_comp: &'a mut BattleComp,
    pub enemy_comp: &'a mut BattleComp,
}

impl<R> NightPhase<'_, R>
where
    R: Rng + ?Sized,
{
    pub fn try_combat(&self) -> anyhow::Result<()> {
        todo!()
    }

    fn try_attack(
        &mut self,
        attacker_position: ShipPosition,
        night_conditions: &NightConditions,
    ) -> anyhow::Result<()> {
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

        let mut picker = TargetPicker::<NightPhaseAttackType>::new(
            self.battle_defs,
            &attacker,
            target_comp,
            Participant::Main,
            None,
        );

        let picked = some_or_return!(picker.choose(self.rng), Ok(()));

        let attack_type = picked.attack_type;
        let mut target = target_comp
            .get_ship_mut(picked.position)
            .expect(SHIP_NOT_FOUND);
        let formation_params = self.battle_defs.get_formation_params(
            attack_type,
            attacker.conditions(),
            target.conditions(),
        );
        let historical_params =
            self.battle_defs
                .get_historical_params(self.node_state, &attacker, &target.as_ref());

        let style = match attack_type {
            NightPhaseAttackType::Night(attack_type) => {
                let anti_inst = target.is_installation();
                let cutin_set = attacker.get_possible_night_cutin_set(anti_inst);

                let cutin_term = attacker
                    .calc_night_cutin_term(NightCutinTermParams::new(
                        attacker.is_flagship(),
                        attacker_side,
                        night_conditions,
                    ))
                    .unwrap_or_default();

                let cutin_def = cutin_set
                    .into_iter()
                    .filter_map(|ci| self.battle_defs.night_cutin.get(&ci))
                    .find(|def| {
                        let p = def.rate(cutin_term).unwrap_or_default();
                        self.rng.gen_bool(p)
                    });

                NightPhaseAttackStyle::Night(NightAttackStyle::new(attack_type, cutin_def))
            }
            NightPhaseAttackType::Asw(ty) => ty.into(),
        };

        let attack = NightPhaseAttackParams {
            style,
            engagement,
            attacker: &attacker,
            target: &target.as_ref(),
            formation_params,
            historical_params,
            night_conditions,
        }
        .to_attack();

        attack.apply(self.rng, &mut target)
    }
}
