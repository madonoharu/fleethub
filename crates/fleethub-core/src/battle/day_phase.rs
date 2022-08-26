use itertools::Itertools;
use rand::prelude::*;

use crate::{
    attack::Attack,
    attack::DayPhaseAttackParams,
    battle::target_picker::TargetPicker,
    error::SHIP_NOT_FOUND,
    member::BattleMemberRef,
    types::{
        AirState, BattleDefinitions, DayCombatRound, DayPhaseAttackStyle, DayPhaseAttackType,
        Engagement, Participant, ShellingStyle, ShipPosition,
    },
};

use super::battle_comp::BattleComp;

impl DayCombatRound {
    fn attack_participant(self) -> Participant {
        match self {
            Self::Main1 => Participant::Main,
            Self::Main2 => Participant::Main,
            Self::Escort => Participant::Escort,
        }
    }

    fn target_participant(self) -> Participant {
        match self {
            Self::Main1 => Participant::Main,
            Self::Main2 => Participant::Both,
            Self::Escort => Participant::Escort,
        }
    }
}

pub(super) struct DayPhase<'a, R>
where
    R: Rng + ?Sized,
{
    pub rng: &'a mut R,
    pub battle_defs: &'a BattleDefinitions,
    pub engagement: Engagement,
    pub air_state: AirState,
    pub round: DayCombatRound,
    pub player_comp: &'a mut BattleComp,
    pub enemy_comp: &'a mut BattleComp,
}

impl<'a, R> DayPhase<'a, R>
where
    R: Rng + ?Sized,
{
    pub fn try_combat(&mut self) -> anyhow::Result<()> {
        let attack_participant = self.round.attack_participant();
        let target_participant = self.round.target_participant();

        let player_comp_has_inst = self.player_comp.has_installation(target_participant);
        let enemy_comp_has_inst = self.enemy_comp.has_installation(target_participant);

        let player_order =
            self.player_comp
                .order_by_range(self.rng, attack_participant, enemy_comp_has_inst);
        let enemy_order =
            self.enemy_comp
                .order_by_range(self.rng, attack_participant, player_comp_has_inst);

        player_order
            .interleave(enemy_order)
            .try_for_each(|attacker_position| self.try_attack(attacker_position))
    }

    fn fleet_los_mod(&self, attacker_position: ShipPosition) -> f64 {
        if attacker_position.side().is_player() {
            self.player_comp.fleet_los_mod(attacker_position.fleet_type)
        } else {
            self.enemy_comp.fleet_los_mod(attacker_position.fleet_type)
        }
    }

    fn try_attack(&mut self, attacker_position: ShipPosition) -> anyhow::Result<()> {
        let target_participant = self.round.target_participant();

        let attacker_side = attacker_position.side();
        let engagement = self.engagement;
        let air_state_rank = self.air_state.rank(attacker_side);
        let fleet_los_mod = self.fleet_los_mod(attacker_position);

        let (attacker_comp, target_comp) = if attacker_side.is_player() {
            (&self.player_comp, &mut self.enemy_comp)
        } else {
            (&self.enemy_comp, &mut self.player_comp)
        };

        let attacker = attacker_comp
            .get_ship(attacker_position)
            .expect(SHIP_NOT_FOUND);

        let mut picker = TargetPicker::<DayPhaseAttackType>::new(
            self.battle_defs,
            &attacker,
            target_comp,
            target_participant,
        );

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

        let style = match attack_type {
            DayPhaseAttackType::Shelling(attack_type) => {
                let is_main_flagship = attacker.position.is_main_flagship();

                let observation_term = attacker
                    .calc_observation_term(fleet_los_mod, is_main_flagship, air_state_rank)
                    .unwrap_or_default();
                let anti_inst = target.is_installation();
                let day_cutin_set = attacker.get_possible_day_cutin_set(anti_inst);

                let cutin_def = day_cutin_set
                    .into_iter()
                    .filter_map(|ci| self.battle_defs.day_cutin.get(&ci))
                    .find(|def| def.gen_bool(observation_term, self.rng));

                let style = ShellingStyle::new(attack_type, cutin_def);
                DayPhaseAttackStyle::Shelling(style)
            }
            DayPhaseAttackType::Asw(ty) => ty.into(),
        };

        DayPhaseAttackParams {
            style,
            engagement,
            attacker: &attacker,
            target: &target.as_ref(),
            formation_params,
        }
        .to_attack()
        .apply(self.rng, &mut target)
    }
}

pub struct DayPhaseAction<'a> {
    pub attack_type: DayPhaseAttackType,
    pub battle_defs: &'a BattleDefinitions,
    pub air_state: AirState,
    pub engagement: Engagement,
    pub fleet_los_mod: f64,
    pub attacker: &'a BattleMemberRef<'a>,
    pub target: &'a BattleMemberRef<'a>,
}

impl DayPhaseAction<'_> {
    fn attack<R: Rng + ?Sized>(self, rng: &mut R) -> Attack {
        let attack_type = self.attack_type;
        let attacker = self.attacker;
        let target = self.target;
        let attacker_side = attacker.side();
        let engagement = self.engagement;
        let air_state_rank = self.air_state.rank(attacker_side);
        let fleet_los_mod = self.fleet_los_mod;

        let style = match attack_type {
            DayPhaseAttackType::Shelling(attack_type) => {
                let is_main_flagship = attacker.position.is_main_flagship();

                let observation_term = attacker
                    .calc_observation_term(fleet_los_mod, is_main_flagship, air_state_rank)
                    .unwrap_or_default();
                let anti_inst = target.is_installation();
                let day_cutin_set = attacker.get_possible_day_cutin_set(anti_inst);

                let cutin_def = day_cutin_set
                    .into_iter()
                    .filter_map(|ci| self.battle_defs.day_cutin.get(&ci))
                    .find(|def| def.gen_bool(observation_term, rng));

                let style = ShellingStyle::new(attack_type, cutin_def);
                DayPhaseAttackStyle::Shelling(style)
            }
            DayPhaseAttackType::Asw(ty) => ty.into(),
        };

        let formation_params = self.battle_defs.get_formation_params(
            attack_type,
            attacker.conditions(),
            target.conditions(),
        );

        DayPhaseAttackParams {
            style,
            engagement,
            attacker,
            target,
            formation_params,
        }
        .to_attack()
    }
}
