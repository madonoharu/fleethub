use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    attack::{
        AswAttackParams, DayPhaseAttackParams, NightPhaseAttackParams, SupportShellingAttackParams,
        TorpedoAttackParams,
    },
    member::BattleMemberRef,
    ship::{NightCutinTermParams, Ship},
    types::{
        AswAttackStyle, AswPhase, AttackType, BattleDefinitions, DayPhaseAttackStyle,
        DayPhaseAttackType, FormationParams, HistoricalParams, NightAttackStyle, NightAttackType,
        NightPhaseAttackStyle, NightPhaseAttackType, ShellingStyle, ShellingType,
        SupportShellingStyle, SupportShellingType, TorpedoAttackStyle, TorpedoAttackType,
    },
    utils::some_or_return,
};

use super::{ActionReport, AttackAnalyzerConfig, AttackReport};

pub struct AttackAnalyzer<'a> {
    pub battle_defs: &'a BattleDefinitions,
    pub config: AttackAnalyzerConfig,
    pub attacker: &'a Ship,
    pub target: &'a Ship,
}

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct AttackAnalysis {
    pub attacker_is_player: bool,
    pub attacker_ship_id: u16,
    pub target_ship_id: u16,
    pub historical_params: HistoricalParams,

    pub day: ActionReport<DayPhaseAttackStyle>,
    pub night: ActionReport<NightPhaseAttackStyle>,
    pub closing_torpedo: ActionReport<TorpedoAttackStyle>,
    pub opening_asw: ActionReport<AswAttackStyle>,
    pub support_shelling: ActionReport<SupportShellingStyle>,
}

impl AttackAnalyzer<'_> {
    pub fn analyze(&self) -> AttackAnalysis {
        let day = self.analyze_day_phase_action();
        let night = self.analyze_night_phase_action();
        let closing_torpedo = self.analyze_torpedo();
        let opening_asw = self.analyze_opening_asw();
        let support_shelling = self.analyze_support_shelling();

        let historical_params = self.get_historical_params();

        AttackAnalysis {
            attacker_is_player: self.config.attacker.side().is_player(),
            attacker_ship_id: self.attacker.ship_id,
            target_ship_id: self.target.ship_id,
            historical_params,

            day,
            night,
            closing_torpedo,
            opening_asw,
            support_shelling,
        }
    }

    fn attacker_combat_ship(&self) -> BattleMemberRef {
        let conditions = self.config.attacker.conditions;
        BattleMemberRef::new(
            self.attacker,
            conditions.position,
            conditions.formation,
            conditions.amagiri_index,
        )
    }

    fn target_combat_ship(&self) -> BattleMemberRef {
        let conditions = self.config.target.conditions;
        BattleMemberRef::new(
            self.target,
            conditions.position,
            conditions.formation,
            conditions.amagiri_index,
        )
    }

    fn get_formation_params(&self, attack_type: impl Into<AttackType>) -> FormationParams {
        self.battle_defs.get_formation_params(
            attack_type,
            self.config.attacker.conditions,
            self.config.target.conditions,
        )
    }

    fn get_historical_params(&self) -> HistoricalParams {
        self.battle_defs.get_historical_params(
            self.config.node_state,
            &self.attacker_combat_ship(),
            &self.target_combat_ship(),
        )
    }

    pub fn calc_observation_term(&self) -> Option<f64> {
        let attacker = &self.attacker_combat_ship();
        let fleet_los_mod = self.config.attacker.fleet_los_mod?;
        let is_main_flagship = attacker.position.is_main_flagship();
        let air_state_rank = self.config.air_state.rank(attacker.side());

        attacker.calc_observation_term(fleet_los_mod, is_main_flagship, air_state_rank)
    }

    fn analyze_shelling_attack_rates(
        &self,
        attack_type: ShellingType,
    ) -> Vec<(DayPhaseAttackStyle, Option<f64>)> {
        let attacker = &self.attacker_combat_ship();
        let target = &self.target_combat_ship();
        let anti_inst = target.is_installation();
        let observation_term = self.calc_observation_term();

        let day_cutin_set = attacker.get_possible_day_cutin_set(anti_inst);
        let mut total_cutin_rate = Some(0.0);
        let mut data = Vec::with_capacity(day_cutin_set.len() + 1);

        for cutin in day_cutin_set {
            let cutin_def = self.battle_defs.get_day_cutin(Some(cutin)).unwrap();
            let base_rate = observation_term.map(|v| cutin_def.rate(v));

            let rate = if let Some((total_cutin_rate, base_rate)) =
                total_cutin_rate.as_mut().zip(base_rate)
            {
                let actual_rate = (1.0 - *total_cutin_rate) * base_rate;
                *total_cutin_rate += actual_rate;
                Some(actual_rate)
            } else {
                total_cutin_rate = None;
                None
            };

            let style =
                DayPhaseAttackStyle::Shelling(ShellingStyle::new(attack_type, Some(cutin_def)));

            data.push((style, rate));
        }

        let normal_attack_rate = total_cutin_rate.map(|v| 1.0 - v);

        data.push((
            DayPhaseAttackStyle::Shelling(ShellingStyle::new(attack_type, None)),
            normal_attack_rate,
        ));
        data.retain(|(_, rate)| *rate != Some(0.0));

        data
    }

    pub fn analyze_day_phase_attack(
        &self,
        style: DayPhaseAttackStyle,
        proc_rate: Option<f64>,
    ) -> AttackReport<DayPhaseAttackStyle> {
        let node_state = self.config.node_state;
        let formation_params = self.get_formation_params(style.to_attack_type());
        let historical_params = self.get_historical_params();

        let attack_params = DayPhaseAttackParams {
            style: style.clone(),
            engagement: self.config.engagement,
            attacker: &self.attacker_combat_ship(),
            target: &self.target_combat_ship(),
            formation_params,
            historical_params,
            node_state,
            balloons: self.config.attacker.balloons,
        }
        .calc_attack_params();

        AttackReport::new(style, proc_rate, attack_params)
    }

    pub fn analyze_day_phase_action(&self) -> ActionReport<DayPhaseAttackStyle> {
        let attacker = &self.attacker_combat_ship();
        let target = &self.target_combat_ship();
        let attack_type = attacker.select_day_phase_attack_type(target);
        let attack_type = some_or_return!(attack_type, ActionReport::empty());

        let node_state = self.config.node_state;
        let engagement = self.config.engagement;
        let formation_params = self.get_formation_params(attack_type);
        let historical_params = self.get_historical_params();

        let styles = match attack_type {
            DayPhaseAttackType::Shelling(attack_type) => {
                self.analyze_shelling_attack_rates(attack_type)
            }
            DayPhaseAttackType::Asw(attack_type) => {
                vec![(attack_type.into(), Some(1.0))]
            }
        };

        let vec = styles
            .into_iter()
            .map(|(style, proc_rate)| {
                let attack_params = DayPhaseAttackParams {
                    style: style.clone(),
                    engagement,
                    attacker,
                    target,
                    formation_params,
                    historical_params,
                    node_state,
                    balloons: self.config.attacker.balloons,
                }
                .calc_attack_params();

                AttackReport::new(style, proc_rate, attack_params)
            })
            .collect();

        ActionReport::new(vec)
    }

    pub fn analyze_night_phase_action(&self) -> ActionReport<NightPhaseAttackStyle> {
        let attacker = &self.attacker_combat_ship();
        let target = &self.target_combat_ship();
        let attack_type = attacker.select_night_phase_attack_type(target);
        let attack_type = some_or_return!(attack_type, ActionReport::empty());

        let engagement = self.config.engagement;
        let formation_params = self.get_formation_params(attack_type);
        let historical_params = self.get_historical_params();
        let night_conditions = &self.config.night_conditions();

        let styles = match attack_type {
            NightPhaseAttackType::Night(attack_type) => self.analyze_night_attack(attack_type),
            NightPhaseAttackType::Asw(attack_type) => {
                vec![(attack_type.into(), Some(1.0))]
            }
        };

        let data = styles
            .into_iter()
            .map(|(style, proc_rate)| {
                let attack_params = NightPhaseAttackParams {
                    style: style.clone(),
                    engagement,
                    attacker,
                    target,
                    formation_params,
                    historical_params,
                    night_conditions,
                }
                .calc_attack_params();
                AttackReport::new(style, proc_rate, attack_params)
            })
            .collect::<Vec<_>>();

        ActionReport::new(data)
    }

    fn analyze_night_attack(
        &self,
        attack_type: NightAttackType,
    ) -> Vec<(NightPhaseAttackStyle, Option<f64>)> {
        let attacker = &self.attacker_combat_ship();
        let target = &self.target_combat_ship();
        let anti_inst = target.is_installation();
        let night_cutin_set = attacker.get_possible_night_cutin_set(anti_inst);
        let cutin_defs = self.battle_defs.get_night_cutin_defs(night_cutin_set);

        let cutin_term = if night_cutin_set
            .into_iter()
            .any(|ci| ci.is_night_zuiun_cutin())
        {
            self.calc_night_zuiun_cutin_term()
        } else {
            self.calc_night_cutin_term()
        };

        let mut data = cutin_defs
            .scan(0.0, |total, def| {
                let style = NightAttackStyle::new(attack_type, Some(def));

                let actual_rate = cutin_term.and_then(|term| {
                    let individual_rate = def.rate(term)?;
                    let actual_rate = (1.0 - *total) * individual_rate;
                    *total += actual_rate;
                    Some(actual_rate)
                });

                Some((style, actual_rate))
            })
            .collect::<Vec<_>>();

        let total_cutin_rate = data.iter().map(|(_, rate)| *rate).sum::<Option<f64>>();
        let normal_attack_rate = total_cutin_rate.map(|r| 1.0 - r);
        data.push((NightAttackStyle::new(attack_type, None), normal_attack_rate));

        data.into_iter()
            .filter(|(_, rate)| *rate != Some(0.0))
            .map(|(style, rate)| (NightPhaseAttackStyle::Night(style), rate))
            .collect()
    }

    pub fn calc_night_cutin_term(&self) -> Option<f64> {
        let attacker = self.attacker_combat_ship();

        let params = NightCutinTermParams::new(
            attacker.is_flagship(),
            attacker.side(),
            &self.config.night_conditions(),
        );

        attacker.calc_night_cutin_term(params)
    }

    pub fn calc_night_zuiun_cutin_term(&self) -> Option<f64> {
        let attacker = self.attacker_combat_ship();

        let params = NightCutinTermParams::new(
            attacker.is_flagship(),
            attacker.side(),
            &self.config.night_conditions(),
        );

        attacker.calc_night_zuiun_cutin_term(params)
    }

    fn analyze_torpedo(&self) -> ActionReport<TorpedoAttackStyle> {
        let attack_type = TorpedoAttackType;
        let style = attack_type.into();

        let attacker = &self.attacker_combat_ship();
        let target = &self.target_combat_ship();
        let engagement = self.config.engagement;
        let node_state = self.config.node_state;
        let formation_params = self.get_formation_params(attack_type);
        let historical_params = self.get_historical_params();

        if attacker.naked_torpedo().unwrap_or_default() == 0 || !target.is_attackable_by_torpedo() {
            return ActionReport::empty();
        }

        let params = TorpedoAttackParams {
            attacker,
            target,
            engagement,
            formation_params,
            historical_params,
            node_state,
        }
        .calc_attack_params();

        ActionReport::one(style, params)
    }

    fn analyze_opening_asw(&self) -> ActionReport<AswAttackStyle> {
        let attacker = &self.attacker_combat_ship();
        let target = &self.target_combat_ship();

        if !target.is_submarine() || !attacker.can_do_opening_asw() {
            return ActionReport::empty();
        }

        let phase = AswPhase::Opening;
        let attack_type = some_or_return!(
            attacker.select_asw_attack_type(phase),
            ActionReport::empty()
        );
        let style = AswAttackStyle { attack_type };

        let engagement = self.config.engagement;
        let formation_params = self.get_formation_params(attack_type);
        let historical_params = self.get_historical_params();

        let params = AswAttackParams {
            style,
            phase,
            attacker,
            target,
            engagement,
            formation_params,
            historical_params,
        }
        .calc_attack_params();

        ActionReport::one(style, params)
    }

    fn analyze_support_shelling(&self) -> ActionReport<SupportShellingStyle> {
        let attacker = &self.attacker_combat_ship();
        let target = &self.target_combat_ship();

        let attack_type = if let Some(DayPhaseAttackType::Shelling(attack_type)) =
            attacker.select_day_phase_attack_type(target)
        {
            SupportShellingType(attack_type)
        } else {
            return ActionReport::empty();
        };

        let formation_params = self.get_formation_params(attack_type);

        let params = SupportShellingAttackParams {
            attack_type,
            attacker,
            target,
            engagement: self.config.engagement,
            formation_params,
            node_state: self.config.node_state,
        }
        .calc_attack_params();

        let style = SupportShellingStyle { attack_type };
        ActionReport::one(style, params)
    }
}
