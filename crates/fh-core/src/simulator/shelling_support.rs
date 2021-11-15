use anyhow::Result;
use fh_macro::FhAbi;
use rand::prelude::*;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    attack::{
        get_day_battle_attack_type, AttackPowerModifiers, DayBattleAttackType, DefenseParams,
        ShellingAttackType, ShellingSupportAttackParams,
    },
    comp::Comp,
    fleet::Fleet,
    ship::Ship,
    types::{BattleConfig, Engagement, Formation, FormationDef, Side},
};

use super::{BattleLogger, SimulatorResult};

impl Fleet {
    fn choose_target<R: Rng + ?Sized>(
        &self,
        rng: &mut R,
        attacker: &Ship,
    ) -> Option<(ShellingAttackType, usize)> {
        self.ships
            .iter()
            .filter_map(|(i, target)| {
                let attack_type = get_day_battle_attack_type(attacker, target);

                match attack_type {
                    Some(DayBattleAttackType::Shelling(t)) => Some((t, i)),
                    _ => None,
                }
            })
            .choose(rng)
    }
}

impl Comp {
    fn choose_target<R: Rng + ?Sized>(
        &mut self,
        rng: &mut R,
        attacker: &Ship,
        protection_rate: f64,
    ) -> Option<(ShellingAttackType, usize, &mut Ship)> {
        let m = self.main.choose_target(rng, attacker);
        let e = self
            .escort
            .as_mut()
            .and_then(|f| f.choose_target(rng, attacker));

        match (m, e) {
            (Some(m), Some(e)) => {
                if rng.gen_bool(0.5) {
                    let (t, i) = e;
                    let ship = self.escort.as_mut()?.ships.get_mut(i)?;
                    Some((t, i, ship))
                } else {
                    let (t, i) = if m.1 == 0 && rng.gen_bool(protection_rate) {
                        self.main.choose_target(rng, attacker)?
                    } else {
                        m
                    };

                    let ship = self.main.ships.get_mut(i)?;
                    Some((t, i, ship))
                }
            }

            (Some((t, i)), None) => {
                let ship = self.main.ships.get_mut(i)?;
                Some((t, i, ship))
            }

            (None, Some((t, i))) => {
                let ship = self.escort.as_mut()?.ships.get_mut(i)?;
                Some((t, i, ship))
            }

            _ => None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, FhAbi, TS)]
pub struct ShellingSupportSimulatorParams {
    attacker_formation: Formation,
    target_formation: Formation,
    engagement: Engagement,
    external_power_mods: AttackPowerModifiers,
}

struct ShellingSupportBattle<'a, R>
where
    R: Rng + ?Sized,
{
    rng: &'a mut R,
    config: &'a BattleConfig,
    attacker_fleet: &'a Fleet,
    target_comp: &'a mut Comp,
    engagement: Engagement,
    attacker_formation_def: &'a FormationDef,
    target_formation_def: &'a FormationDef,
    external_power_mods: AttackPowerModifiers,
}

impl<'a, R> ShellingSupportBattle<'a, R>
where
    R: Rng + ?Sized,
{
    fn attack(&mut self, attacker: &Ship) -> Result<()> {
        let protection_rate = self
            .target_formation_def
            .protection_rate
            .unwrap_or_default();

        let chosen = self
            .target_comp
            .choose_target(self.rng, attacker, protection_rate);

        let (attack_type, _, target) = match chosen {
            Some(v) => v,
            None => return Ok(()),
        };

        let target_side = Side::Enemy;
        let armor_penetration = 0.0;
        let defense_params = DefenseParams::from_target(target, target_side, armor_penetration);

        let attack = ShellingSupportAttackParams {
            attack_type,
            attacker,
            target,
            attacker_formation_def: &self.attacker_formation_def,
            target_formation_def: &self.target_formation_def,
            engagement: self.engagement,
            external_power_mods: self.external_power_mods.clone(),
            defense_params,
        }
        .into_attack_params()
        .into_attack();

        let damage_value = attack.gen_damage_value(self.rng)?;
        target.take_damage(damage_value);

        Ok(())
    }

    fn run(&mut self) -> Result<()> {
        self.attacker_fleet
            .ships
            .values()
            .try_for_each(|attacker| self.attack(attacker))
    }
}

pub struct ShellingSupportSimulator<'a, R>
where
    R: Rng + ?Sized,
{
    battle: ShellingSupportBattle<'a, R>,
}

impl<'a, R> ShellingSupportSimulator<'a, R>
where
    R: Rng + ?Sized,
{
    pub fn new(
        rng: &'a mut R,
        config: &'a BattleConfig,
        attacker_fleet: &'a Fleet,
        target_comp: &'a mut Comp,
        params: ShellingSupportSimulatorParams,
    ) -> Self {
        let ShellingSupportSimulatorParams {
            attacker_formation,
            target_formation,
            engagement,
            external_power_mods,
        } = params;

        let attacker_formation_def = config.get_formation_def(attacker_formation, 6, 0);
        let target_formation_def = config.get_formation_def(target_formation, 6, 0);

        Self {
            battle: ShellingSupportBattle {
                rng,
                config,
                attacker_fleet,
                target_comp,
                engagement,
                attacker_formation_def,
                target_formation_def,
                external_power_mods,
            },
        }
    }

    pub fn run(&mut self, times: usize) -> Result<SimulatorResult> {
        let mut logger = BattleLogger::new(times);

        (0..times).try_for_each(|_| -> Result<()> {
            self.battle.run()?;
            logger.write(&self.battle.target_comp);
            self.battle.target_comp.reset_battle_state();
            Ok(())
        })?;

        Ok(logger.into_simulator_result())
    }
}
