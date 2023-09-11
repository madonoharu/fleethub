use crate::{
    member::BattleMemberRef,
    types::{
        AswPhase, DayPhaseAttackStyle, Engagement, FormationParams, HistoricalParams, NodeState,
    },
};

use super::{AswAttackParams, Attack, AttackParams, ShellingAttackParams};

pub struct DayPhaseAttackParams<'a> {
    pub style: DayPhaseAttackStyle,
    pub engagement: Engagement,
    pub attacker: &'a BattleMemberRef<'a>,
    pub target: &'a BattleMemberRef<'a>,
    pub formation_params: FormationParams,
    pub historical_params: HistoricalParams,
    pub node_state: NodeState,
    pub balloons: usize,
}

impl DayPhaseAttackParams<'_> {
    pub fn calc_attack_params(&self) -> AttackParams {
        let Self {
            style,
            attacker,
            target,
            ..
        } = self;

        let engagement = self.engagement;
        let formation_params = self.formation_params;
        let historical_params = self.historical_params;
        let node_state = self.node_state;

        match style.clone() {
            DayPhaseAttackStyle::Shelling(style) => ShellingAttackParams {
                style,
                attacker,
                target,
                engagement,
                formation_params,
                historical_params,
                node_state,
                balloons: self.balloons,
            }
            .calc_attack_params(),
            DayPhaseAttackStyle::Asw(style) => AswAttackParams {
                style,
                phase: AswPhase::Day,
                attacker,
                target,
                engagement,
                formation_params,
                historical_params,
            }
            .calc_attack_params(),
        }
    }

    pub fn to_attack(&self) -> Attack {
        self.calc_attack_params().into_attack()
    }
}
