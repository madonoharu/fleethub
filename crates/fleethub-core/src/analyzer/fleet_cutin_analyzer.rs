use serde::Serialize;
use tsify::Tsify;

use crate::{
    analyzer::AttackReport,
    attack::{
        calc_fleet_cutin_rate, get_possible_fleet_cutin_effect_vec, FleetCutinAttackParams,
        FleetCutinEffect,
    },
    attack::{NightAttackParams, ShellingAttackParams},
    comp::Comp,
    member::BattleMemberRef,
    ship::Ship,
    types::{
        AttackType, BattleDefinitions, DayCutinLike, Engagement, FleetCutin, FleetType, Formation,
        NightAttackStyle, NightAttackType, NightConditions, NodeState, ShellingStyle, ShellingType,
        ShipConditions, Time,
    },
};

#[derive(Debug, Serialize, Tsify)]
pub struct FleetCutinAttackReport<T> {
    index: usize,
    ship_id: u16,
    power_mod: f64,
    #[serde(flatten)]
    attack_report: AttackReport<T>,
}

#[derive(Debug, Serialize, Tsify)]
pub struct FleetCutinReport<T> {
    cutin: FleetCutin,
    rate: Option<f64>,
    formation: Formation,
    attacks: Vec<FleetCutinAttackReport<T>>,
}

pub struct FleetCutinAnalyzer<'a> {
    pub battle_defs: &'a BattleDefinitions,
    pub node_state: NodeState,
    pub engagement: Engagement,
    pub comp: &'a Comp,
    pub target_ship: &'a Ship,
    pub target_conditions: ShipConditions,
}

impl<'a> FleetCutinAnalyzer<'a> {
    pub fn new(
        battle_defs: &'a BattleDefinitions,
        node_state: NodeState,
        engagement: Engagement,
        comp: &'a Comp,
        target_ship: &'a Ship,
    ) -> Self {
        let target_side = !comp.side();

        Self {
            battle_defs,
            node_state,
            engagement,
            comp,
            target_ship,
            target_conditions: ShipConditions::with_side(target_side),
        }
    }

    fn target(&self) -> BattleMemberRef<'_> {
        let conditions = self.target_conditions;
        BattleMemberRef::new(
            self.target_ship,
            conditions.position,
            conditions.formation,
            conditions.amagiri_index,
        )
    }

    fn analyze_shelling(
        &self,
        formation: Formation,
        effect: FleetCutinEffect,
    ) -> FleetCutinReport<ShellingStyle> {
        let fleet_type = FleetType::Main;
        let fleet = &self.comp.main;
        let node_state = self.node_state;
        let engagement = self.engagement;
        let balloons = self.comp.balloons();

        let cutin = effect.cutin;
        let rate = calc_fleet_cutin_rate(fleet, cutin);

        let attacks = effect
            .attacks
            .into_iter()
            .map(|params| {
                let FleetCutinAttackParams {
                    index,
                    power_mod,
                    accuracy_mod,
                } = params;

                let attacker = self
                    .comp
                    .get_battle_member_by_index(formation, fleet_type, index)
                    .unwrap_or_else(|| unreachable!());
                let target = &self.target();
                let style = ShellingStyle {
                    attack_type: ShellingType::Normal,
                    cutin: Some(DayCutinLike::FleetCutin(cutin)),
                    power_mod,
                    accuracy_mod,
                    hits: 1.0,
                };

                let params = ShellingAttackParams {
                    style: style.clone(),
                    attacker: &attacker,
                    target,
                    engagement,
                    formation_params: self.battle_defs.get_formation_params(
                        AttackType::Shelling(Default::default()),
                        attacker.conditions(),
                        target.conditions(),
                    ),
                    historical_params: self
                        .battle_defs
                        .get_historical_params(node_state, &attacker, target),
                    node_state,
                    balloons,
                }
                .calc_attack_params();

                let attack_report = AttackReport::new(style, None, params);
                FleetCutinAttackReport {
                    index,
                    ship_id: attacker.ship_id,
                    power_mod,
                    attack_report,
                }
            })
            .collect::<Vec<_>>();

        FleetCutinReport {
            cutin,
            rate,
            formation,
            attacks,
        }
    }

    fn analyze_night_attack(
        &self,
        formation: Formation,
        effect: FleetCutinEffect,
        night_conditions: &NightConditions,
    ) -> FleetCutinReport<NightAttackStyle> {
        let fleet_type = self.comp.night_fleet_type();
        let fleet = self.comp.night_fleet();
        let cutin = effect.cutin;
        let rate = calc_fleet_cutin_rate(fleet, cutin);

        let attacks = effect
            .attacks
            .into_iter()
            .map(|params| {
                let FleetCutinAttackParams {
                    index,
                    power_mod,
                    accuracy_mod,
                } = params;

                let attacker = self
                    .comp
                    .get_battle_member_by_index(formation, fleet_type, index)
                    .unwrap_or_else(|| unreachable!());
                let target = &self.target();

                let attack_type = NightAttackType::Normal;

                let style = NightAttackStyle {
                    attack_type,
                    cutin: Some(cutin.into()),
                    power_mod,
                    accuracy_mod,
                    ..Default::default()
                };

                let params = NightAttackParams {
                    style: style.clone(),
                    attacker: &attacker,
                    target,
                    formation_params: self.battle_defs.get_formation_params(
                        attack_type,
                        attacker.conditions(),
                        target.conditions(),
                    ),
                    historical_params: self.battle_defs.get_historical_params(
                        self.node_state,
                        &attacker,
                        target,
                    ),
                    night_conditions,
                }
                .calc_attack_params();

                let attack_report = AttackReport::new(style, None, params);
                FleetCutinAttackReport {
                    index,
                    ship_id: attacker.ship_id,
                    power_mod,
                    attack_report,
                }
            })
            .collect::<Vec<_>>();

        FleetCutinReport {
            cutin,
            rate,
            formation,
            attacks,
        }
    }

    pub fn analyze_shelling_attacks(&self) -> Vec<FleetCutinReport<ShellingStyle>> {
        Formation::iter()
            .flat_map(|formation| {
                let fleet = &self.comp.main;
                let vec = get_possible_fleet_cutin_effect_vec(
                    fleet,
                    formation,
                    self.engagement,
                    Time::Day,
                );

                vec.into_iter()
                    .map(move |effect| self.analyze_shelling(formation, effect))
            })
            .collect()
    }

    pub fn analyze_night_attacks(
        &self,
        night_conditions: &NightConditions,
    ) -> Vec<FleetCutinReport<NightAttackStyle>> {
        Formation::iter()
            .flat_map(|formation| {
                let fleet = self.comp.night_fleet();
                let vec = get_possible_fleet_cutin_effect_vec(
                    fleet,
                    formation,
                    self.engagement,
                    Time::Night,
                );

                vec.into_iter().map(move |effect| {
                    self.analyze_night_attack(formation, effect, night_conditions)
                })
            })
            .collect()
    }

    pub(crate) fn analyze_shelling_attacks_by_formation(
        &self,
        formation: Formation,
    ) -> Vec<FleetCutinReport<ShellingStyle>> {
        let fleet = &self.comp.main;
        let vec = get_possible_fleet_cutin_effect_vec(fleet, formation, self.engagement, Time::Day);

        vec.into_iter()
            .map(move |effect| self.analyze_shelling(formation, effect))
            .collect()
    }

    pub(crate) fn analyze_night_attacks_by_formation(
        &self,
        formation: Formation,
        night_conditions: &NightConditions,
    ) -> Vec<FleetCutinReport<NightAttackStyle>> {
        let fleet = self.comp.night_fleet();
        let vec =
            get_possible_fleet_cutin_effect_vec(fleet, formation, self.engagement, Time::Night);

        vec.into_iter()
            .map(move |effect| self.analyze_night_attack(formation, effect, night_conditions))
            .collect()
    }
}
