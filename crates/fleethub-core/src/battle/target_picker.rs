use rand::prelude::*;

use crate::{
    member::BattleMemberRef,
    types::{
        BattleDefinitions, DayPhaseAttackType, Formation, NightAttackType, NightPhaseAttackType,
        Participant, ShipPosition, SupportShellingType, TorpedoAttackType,
    },
};

use super::battle_comp::BattleComp;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Candidate<T: Clone> {
    pub attack_type: T,
    pub position: ShipPosition,
    pub is_protector: bool,
}

pub struct SearchlightState {
    pub index: usize,
    pub rerolls: usize,
}

pub struct TargetPicker<T>
where
    T: Clone,
{
    candidates: Vec<Candidate<T>>,
    flagship_protection_rate: f64,
    formation: Formation,
    searchlight_state: Option<SearchlightState>,
}

impl<T> TargetPicker<T>
where
    T: Clone,
{
    pub fn choose<R: Rng + ?Sized>(&mut self, rng: &mut R) -> Option<Candidate<T>> {
        #[allow(clippy::useless_asref)]
        let role_mid =
            itertools::partition(self.candidates.as_mut_slice(), |c| c.position.is_main());
        let (main_slice, escort_slice) = self.candidates.split_at(role_mid);

        let target_slice = if escort_slice.is_empty() {
            main_slice
        } else if main_slice.is_empty() {
            escort_slice
        } else if rng.gen() {
            main_slice
        } else {
            escort_slice
        };

        let mut picked = target_slice.choose(rng)?;

        // searchlight rerolls
        if let Some(searchlight) = self.searchlight_state.as_ref() {
            for _ in 0..=searchlight.rerolls {
                if searchlight.index == picked.position.index {
                    break;
                }

                picked = target_slice.choose(rng)?;
            }
        }

        // vanguard reroll
        if self.formation == Formation::VANGUARD && picked.position.is_top_half() {
            picked = target_slice.choose(rng)?
        };

        let flagship_protection =
            picked.position.is_main_flagship() && rng.gen_bool(self.flagship_protection_rate);

        if flagship_protection {
            if let Some(protector) = target_slice.iter().filter(|c| c.is_protector).choose(rng) {
                picked = protector
            }
        }

        Some(picked.clone())
    }
}

impl TargetPicker<DayPhaseAttackType> {
    pub fn new(
        battle_defs: &BattleDefinitions,
        attacker: &BattleMemberRef,
        target_comp: &BattleComp,
        target_participant: Participant,
    ) -> Self {
        let prioritizes_shelling = attacker.prioritizes_shelling();
        let target_formation = target_comp.formation;
        let flagship_protection_rate = battle_defs.get_flagship_protection_rate(target_formation);

        let mut has_shelling = false;
        let mut has_asw = false;
        let mut candidates = target_comp
            .members(target_participant)
            .filter_map(|ship| {
                let attack_type = attacker.select_day_phase_attack_type(&ship)?;

                if attack_type.is_shelling() {
                    has_shelling = true;
                } else {
                    has_asw = true;
                }

                Some(Candidate {
                    attack_type,
                    position: ship.position,
                    is_protector: ship.is_protector(),
                })
            })
            .collect::<Vec<_>>();

        if has_shelling && has_asw {
            candidates.retain(|c| prioritizes_shelling == c.attack_type.is_shelling());
        }

        Self {
            candidates,
            flagship_protection_rate,
            formation: target_formation,
            searchlight_state: None,
        }
    }
}

impl TargetPicker<TorpedoAttackType> {
    pub fn new(
        battle_defs: &BattleDefinitions,
        target_comp: &BattleComp,
        target_participant: Participant,
    ) -> Self {
        let target_formation = target_comp.formation;
        let flagship_protection_rate = battle_defs.get_flagship_protection_rate(target_formation);

        let candidates = target_comp
            .members(target_participant)
            .filter_map(|ship| {
                (!ship.is_installation() && !ship.is_submarine()).then(|| Candidate {
                    attack_type: TorpedoAttackType,
                    position: ship.position,
                    is_protector: ship.is_protector(),
                })
            })
            .collect();

        Self {
            candidates,
            flagship_protection_rate,
            formation: target_formation,
            searchlight_state: None,
        }
    }
}

impl TargetPicker<NightPhaseAttackType> {
    pub fn new(
        battle_defs: &BattleDefinitions,
        attacker: &BattleMemberRef,
        target_comp: &BattleComp,
        target_participant: Participant,
        searchlight_state: Option<SearchlightState>,
    ) -> Self {
        let target_formation = target_comp.formation;
        let flagship_protection_rate = battle_defs.get_flagship_protection_rate(target_formation);

        let mut prioritizes_night_attack = false;
        let mut has_night_attack = false;
        let mut has_asw = false;
        let mut candidates = target_comp
            .members(target_participant)
            .filter_map(|ship| {
                let attack_type = attacker.select_night_phase_attack_type(&ship)?;

                match attack_type {
                    NightPhaseAttackType::Night(NightAttackType::Aerial) => {
                        prioritizes_night_attack = true;
                        has_night_attack = true;
                    }
                    NightPhaseAttackType::Night(_) => {
                        has_night_attack = true;
                    }
                    NightPhaseAttackType::Asw(_) => {
                        has_asw = true;
                    }
                }

                Some(Candidate {
                    attack_type,
                    position: ship.position,
                    is_protector: ship.is_protector(),
                })
            })
            .collect::<Vec<_>>();

        if has_night_attack && has_asw {
            candidates.retain(|c| prioritizes_night_attack == c.attack_type.is_night_attack());
        }

        Self {
            candidates,
            flagship_protection_rate,
            formation: target_formation,
            searchlight_state,
        }
    }
}

impl TargetPicker<SupportShellingType> {
    pub fn new(
        battle_defs: &BattleDefinitions,
        attacker: &BattleMemberRef,
        target_comp: &BattleComp,
    ) -> Self {
        let target_formation = target_comp.formation;
        let flagship_protection_rate = battle_defs.get_flagship_protection_rate(target_formation);

        let candidates = target_comp
            .members(Participant::Both)
            .filter_map(|ship| {
                let attack_type = attacker.select_day_phase_attack_type(&ship)?;

                match attack_type {
                    DayPhaseAttackType::Shelling(t) => Some(Candidate {
                        attack_type: t.into(),
                        position: ship.position,
                        is_protector: ship.is_protector(),
                    }),
                    _ => None,
                }
            })
            .collect::<Vec<_>>();

        Self {
            candidates,
            flagship_protection_rate,
            formation: target_formation,
            searchlight_state: None,
        }
    }
}

#[cfg(test)]
mod test {
    use itertools::Itertools;

    use crate::types::Role;

    use super::*;

    fn pos(role: Role, index: usize) -> ShipPosition {
        ShipPosition {
            fleet_type: role.into(),
            index,
            ..Default::default()
        }
    }

    #[test]
    fn test_target_picker() {
        let main = (0..6).map(|index| Candidate {
            attack_type: (),
            position: pos(Role::Main, index),
            is_protector: index != 0,
        });

        let escort = (0..2).map(|index| Candidate {
            attack_type: (),
            position: pos(Role::Escort, index),
            is_protector: false,
        });

        let mut picker: TargetPicker<()> = TargetPicker {
            candidates: main.chain(escort).collect(),
            flagship_protection_rate: 0.6,
            formation: Formation::CRUISING4,
            searchlight_state: None,
        };

        let mut rng = crate::test::rng(0);

        let counts = (0..100000)
            .map(|_| picker.choose(&mut rng).unwrap().position)
            .counts();

        for (position, count) in counts.into_iter() {
            if position.is_main_flagship() {
                assert!((3161..=3505).contains(&count));
            } else if position.is_main() {
                assert!((9029..=9692).contains(&count));
            } else {
                assert!((24551..=25528).contains(&count));
            }
        }
    }
}
