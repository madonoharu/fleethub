use anyhow::{Context, Result};
use rand::prelude::*;

use crate::{
    attack::create_airstrike_params,
    comp::Comp,
    error::CalculationError,
    member::MemberImpl,
    plane::{PlaneImpl, PlaneMut, PlaneVec},
    types::{AirState, BattleConfig, ContactRank, Formation, Side},
};

fn try_air_defence<R: Rng + ?Sized>(
    rng: &mut R,
    config: &BattleConfig,
    comp: &Comp,
    planes: &mut PlaneVec<PlaneMut>,
    formation: Formation,
) -> Result<(), CalculationError> {
    let formation_mod = config.get_formation_fleet_anti_air_mod(formation);
    let fleet_anti_air = comp.fleet_anti_air(formation_mod);

    let anti_air_cutin = comp.choose_anti_air_cutin(rng, config);

    let member_vec = comp
        .members()
        .filter(|member| member.remains())
        .collect::<Vec<_>>();

    if member_vec.is_empty() {
        return Ok(());
    }

    planes.iter_mut().try_for_each(|plane| {
        let member = member_vec.choose(rng).expect("member_vec.len() > 0");

        member
            .air_defence(fleet_anti_air, anti_air_cutin)
            .try_intercept(rng, plane)
    })
}

struct AirBattle<'a, R>
where
    R: Rng + ?Sized,
{
    rng: &'a mut R,
    config: &'a BattleConfig,
    player_comp: &'a mut Comp,
    enemy_comp: &'a mut Comp,
}

impl<'a, R> AirBattle<'a, R>
where
    R: Rng + ?Sized,
{
    fn try_fighter_combat(&mut self) -> Result<()> {
        const RECON_PARTICIPATES: bool = false;

        let player_escort_participates = self.enemy_comp.is_combined();
        let enemy_escort_participates = self.enemy_comp.is_combined();

        let player_fp = self
            .player_comp
            .fighter_power(player_escort_participates, RECON_PARTICIPATES)
            .context(CalculationError::UnknownValue)?;
        let enemy_fp = self
            .enemy_comp
            .fighter_power(enemy_escort_participates, RECON_PARTICIPATES)
            .context(CalculationError::UnknownValue)?;

        let air_state = AirState::new(player_fp, enemy_fp);

        let mut player_planes = self
            .player_comp
            .planes_mut(player_escort_participates)
            .collect::<PlaneVec<_>>();
        let mut enemy_planes = self
            .enemy_comp
            .planes_mut(enemy_escort_participates)
            .collect::<PlaneVec<_>>();

        player_planes
            .iter_mut()
            .filter(|plane| plane.participates_in_fighter_combat(RECON_PARTICIPATES))
            .for_each(|plane| plane.suffer_in_fighter_combat(self.rng, air_state, Side::Player));
        enemy_planes
            .iter_mut()
            .filter(|plane| plane.participates_in_fighter_combat(RECON_PARTICIPATES))
            .for_each(|plane| plane.suffer_in_fighter_combat(self.rng, air_state, Side::Enemy));

        let player_contact_rank = player_planes.try_contact(self.rng, air_state, Side::Player)?;
        let enemy_contact_rank = enemy_planes.try_contact(self.rng, air_state, Side::Enemy)?;

        Ok(())
    }

    fn try_air_defence(
        &mut self,
        comp: &Comp,
        formation: Formation,
        attack_planes: &mut PlaneVec<PlaneMut>,
    ) -> Result<(), CalculationError> {
        let formation_mod = self.config.get_formation_fleet_anti_air_mod(formation);
        let fleet_anti_air = comp.fleet_anti_air(formation_mod);

        let anti_air_cutin = comp.choose_anti_air_cutin(self.rng, self.config);

        let member_vec = comp
            .members()
            .filter(|member| member.remains())
            .collect::<Vec<_>>();

        if member_vec.is_empty() {
            return Ok(());
        }

        attack_planes.iter_mut().try_for_each(|plane| {
            let member = member_vec.choose(self.rng).expect("member_vec.len() > 0");

            member
                .air_defence(fleet_anti_air, anti_air_cutin)
                .try_intercept(self.rng, plane)
        })
    }

    fn try_airstrike(
        &mut self,
        attacker_comp: &Comp,
        target_comp: &mut Comp,
        contact_rank: Option<ContactRank>,
    ) -> anyhow::Result<()> {
        let mut target_vec = target_comp
            .members_mut()
            .filter(|member| member.remains())
            .collect::<Vec<_>>();

        if target_vec.is_empty() {
            return Ok(());
        }

        attacker_comp.ships().try_for_each(|attacker| {
            let proficiency_modifiers = attacker.proficiency_modifiers(None);
            let remaining_ammo_mod = attacker.remaining_ammo_mod();

            attacker
                .planes()
                .filter(|plane| plane.remains() && plane.is_attacker())
                .try_for_each(|plane| {
                    let target = target_vec
                        .choose_mut(self.rng)
                        .expect("member_vec.len() > 0");

                    let value = create_airstrike_params(
                        self.rng,
                        plane,
                        &proficiency_modifiers,
                        remaining_ammo_mod,
                        contact_rank,
                        target,
                    )
                    .into_attack()
                    .gen_damage_value(self.rng)?;

                    target.ship.take_damage(value);

                    Ok(())
                })
        })
    }

    pub fn try_air_battle(&self) -> anyhow::Result<()> {
        todo!()
    }
}
