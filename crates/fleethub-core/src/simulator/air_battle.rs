#![allow(dead_code, unused_variables)]

use anyhow::Result;
use rand::prelude::*;

use crate::{
    attack::create_airstrike_params,
    comp::Comp,
    error::CalculationError,
    member::MemberImpl,
    plane::{PlaneImpl, PlaneMut, PlaneVec},
    types::{AirState, AirWaveType, BattleDefinitions, ContactRank, Formation, Side},
};

fn try_fighter_combat<R: Rng + ?Sized>(
    rng: &mut R,
    player_planes: &mut PlaneVec<PlaneMut>,
    enemy_planes: &mut PlaneVec<PlaneMut>,
    air_type: AirWaveType,
) -> Result<AirState, CalculationError> {
    let player_fp = player_planes.fighter_power(air_type)?;
    let enemy_fp = enemy_planes.fighter_power(air_type)?;
    let air_state = AirState::new(player_fp, enemy_fp);

    player_planes
        .iter_mut()
        .filter(|plane| plane.participates_in_fighter_combat(air_type))
        .for_each(|plane| plane.suffer_in_fighter_combat(rng, air_state, Side::Player));
    enemy_planes
        .iter_mut()
        .filter(|plane| plane.participates_in_fighter_combat(air_type))
        .for_each(|plane| plane.suffer_in_fighter_combat(rng, air_state, Side::Enemy));

    Ok(air_state)
}

fn try_air_defense<R: Rng + ?Sized>(
    rng: &mut R,
    config: &BattleDefinitions,
    attacker_comp: &mut Comp,
    target_comp: &Comp,
    escort_participates: bool,
    formation: Formation,
) -> Result<(), CalculationError> {
    let formation_mod = config.get_formation_fleet_anti_air_mod(formation);
    let fleet_adjusted_anti_air = target_comp.adjusted_anti_air(formation_mod);

    let anti_air_cutin = target_comp.choose_anti_air_cutin(rng, config);

    let member_vec = target_comp
        .members()
        .filter(|member| member.remains())
        .collect::<Vec<_>>();

    if member_vec.is_empty() {
        return Ok(());
    }

    attacker_comp
        .planes_mut(escort_participates)
        .filter(|plane| plane.is_attacker())
        .try_for_each(|mut plane| {
            let member = member_vec.choose(rng).expect("member_vec.len() > 0");

            member
                .air_defense(fleet_adjusted_anti_air, anti_air_cutin)
                .try_intercept(rng, &mut plane)
        })
}

fn try_airstrike<R: Rng + ?Sized>(
    rng: &mut R,
    attacker_comp: &Comp,
    target_comp: &mut Comp,
    escort_participates: bool,
    contact_rank: Option<ContactRank>,
) -> anyhow::Result<()> {
    let mut target_vec = target_comp
        .members_mut()
        .filter(|member| member.remains())
        .collect::<Vec<_>>();

    if target_vec.is_empty() {
        return Ok(());
    }

    attacker_comp
        .members()
        .filter(|member| member.is_main() || escort_participates)
        .try_for_each(|attacker| {
            let proficiency_modifiers = attacker.proficiency_modifiers(None);
            let remaining_ammo_mod = attacker.remaining_ammo_mod();

            attacker
                .planes()
                .filter(|plane| plane.remains() && plane.is_attacker())
                .try_for_each(|plane| {
                    let target = target_vec.choose_mut(rng).expect("member_vec.len() > 0");

                    let value = create_airstrike_params(
                        rng,
                        plane,
                        &proficiency_modifiers,
                        remaining_ammo_mod,
                        contact_rank,
                        target,
                    )
                    .into_attack()
                    .gen_damage_value(rng)?;

                    target.ship.take_damage(value);

                    Ok(())
                })
        })
}

struct AerialCombat<'a, R>
where
    R: Rng + ?Sized,
{
    rng: &'a mut R,
    battle_defs: &'a BattleDefinitions,
    player_comp: &'a mut Comp,
    enemy_comp: &'a mut Comp,
    escort_participates: bool,
    player_formation: Formation,
    enemy_formation: Formation,
}

impl<'a, R> AerialCombat<'a, R>
where
    R: Rng + ?Sized,
{
    fn try_jet_assault_phase(&mut self) -> Result<()> {
        let escort_participates = self.escort_participates;

        let mut player_planes = self
            .player_comp
            .planes_mut(escort_participates)
            .filter(|plane| plane.is_jet_plane())
            .collect::<PlaneVec<_>>();
        let mut enemy_planes = self
            .enemy_comp
            .planes_mut(escort_participates)
            .filter(|plane| plane.is_jet_plane())
            .collect::<PlaneVec<_>>();

        let air_state = try_fighter_combat(
            self.rng,
            &mut player_planes,
            &mut enemy_planes,
            AirWaveType::Jet,
        )?;

        let player_contact_rank =
            player_planes.try_contact(self.rng, air_state.rank(Side::Player))?;
        let enemy_contact_rank = enemy_planes.try_contact(self.rng, air_state.rank(Side::Enemy))?;

        try_airstrike(
            self.rng,
            self.player_comp,
            self.enemy_comp,
            escort_participates,
            player_contact_rank,
        )?;

        try_airstrike(
            self.rng,
            self.enemy_comp,
            self.player_comp,
            escort_participates,
            enemy_contact_rank,
        )?;

        Ok(())
    }

    fn try_aerial_combat(&mut self) -> Result<AirState> {
        let escort_participates = self.escort_participates;

        let mut player_planes = self
            .player_comp
            .planes_mut(escort_participates)
            .collect::<PlaneVec<_>>();
        let mut enemy_planes = self
            .enemy_comp
            .planes_mut(escort_participates)
            .collect::<PlaneVec<_>>();

        let air_state = try_fighter_combat(
            self.rng,
            &mut player_planes,
            &mut enemy_planes,
            AirWaveType::Carrier,
        )?;

        let player_contact_rank =
            player_planes.try_contact(self.rng, air_state.rank(Side::Player))?;
        let enemy_contact_rank = enemy_planes.try_contact(self.rng, air_state.rank(Side::Enemy))?;

        try_air_defense(
            self.rng,
            self.battle_defs,
            self.player_comp,
            self.enemy_comp,
            escort_participates,
            self.enemy_formation,
        )?;

        try_air_defense(
            self.rng,
            self.battle_defs,
            self.enemy_comp,
            self.player_comp,
            escort_participates,
            self.player_formation,
        )?;

        try_airstrike(
            self.rng,
            self.player_comp,
            self.enemy_comp,
            escort_participates,
            player_contact_rank,
        )?;

        try_airstrike(
            self.rng,
            self.enemy_comp,
            self.player_comp,
            escort_participates,
            enemy_contact_rank,
        )?;

        Ok(air_state)
    }
}
