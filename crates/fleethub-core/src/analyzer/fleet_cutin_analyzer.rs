use serde::Serialize;
use tsify::Tsify;

use crate::{
    analyzer::AttackReport,
    attack::{calc_fleet_cutin_rate, get_possible_fleet_cutin_effect_vec, FleetCutinEffect},
    attack::{NightAttackParams, ShellingAttackParams},
    comp::Comp,
    member::BattleMemberRef,
    ship::Ship,
    types::{
        AttackType, BattleDefinitions, DayCutinLike, Engagement, FleetCutin, Formation,
        NightAttackStyle, NightAttackType, NightConditions, Role, ShellingStyle, ShellingType,
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

#[derive(Debug, Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct FleetCutinAnalysis {
    shelling: Vec<FleetCutinReport<ShellingStyle>>,
    night: Vec<FleetCutinReport<NightAttackStyle>>,
}

pub struct FleetCutinAnalyzer<'a> {
    battle_defs: &'a BattleDefinitions,
    comp: &'a Comp,
    engagement: Engagement,
    target_ship: Ship,
    target_conditions: ShipConditions,
}

impl<'a> FleetCutinAnalyzer<'a> {
    pub fn new(battle_defs: &'a BattleDefinitions, comp: &'a Comp, engagement: Engagement) -> Self {
        let target_side = !comp.side();

        Self {
            battle_defs,
            comp,
            engagement,
            target_ship: Default::default(),
            target_conditions: ShipConditions::with_side(target_side),
        }
    }

    fn target(&self) -> BattleMemberRef {
        BattleMemberRef::new(
            &self.target_ship,
            self.target_conditions.position,
            self.target_conditions.formation,
        )
    }

    fn analyze_shelling(
        &self,
        formation: Formation,
        effect: FleetCutinEffect,
    ) -> FleetCutinReport<ShellingStyle> {
        let role = Role::Main;
        let fleet = &self.comp.main;
        let engagement = self.engagement;

        let cutin = effect.cutin;
        let rate = calc_fleet_cutin_rate(fleet, cutin);

        let attacks = effect
            .attacks
            .into_iter()
            .map(|(index, power_mod)| {
                let attacker = self
                    .comp
                    .get_battle_member(formation, role, index)
                    .unwrap_or_else(|| unreachable!());
                let target = &self.target();
                let style = ShellingStyle {
                    attack_type: ShellingType::Normal,
                    cutin: Some(DayCutinLike::FleetCutin(cutin)),
                    power_mod,
                    accuracy_mod: 1.0,
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
        let role = self.comp.night_fleet_role();
        let fleet = self.comp.night_fleet();
        let cutin = effect.cutin;
        let rate = calc_fleet_cutin_rate(fleet, cutin);

        let attacks = effect
            .attacks
            .into_iter()
            .map(|(index, power_mod)| {
                let attacker = self
                    .comp
                    .get_battle_member(formation, role, index)
                    .unwrap_or_else(|| unreachable!());
                let target = &self.target();

                let attack_type = NightAttackType::Normal;

                let style = NightAttackStyle {
                    attack_type,
                    cutin: Some(cutin.into()),
                    power_mod,
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
}
