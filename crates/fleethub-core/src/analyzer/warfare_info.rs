use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    attack::{
        get_day_battle_attack_type, get_night_battle_attack_type, get_oasw_attack_type,
        AswAttackContext, AswAttackType, AswTime, DayBattleAttackType, NightAttackContext,
        NightBattleAttackType, NightSituation, ShellingAttackContext, ShellingSupportAttackContext,
        TorpedoAttackContext, WarfareContext, WarfareShipEnvironment,
    },
    ship::Ship,
    types::{AirState, BattleConfig, DayCutin, Engagement, Formation, NightCutin, OrgType, Role},
};

use super::{AttackInfo, AttackInfoItem, AttackStats, DayCutinRateInfo, NightCutinRateAnalyzer};

pub type DayBattleAttackInfo = AttackInfo<DayBattleAttackType, Option<DayCutin>>;
pub type NightBattleAttackInfo = AttackInfo<NightBattleAttackType, Option<NightCutin>>;
pub type TorpedoAttackInfo = AttackInfo<(), ()>;

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
pub struct WarfareAnalyzerShipEnvironment {
    pub org_type: OrgType,
    pub role: Role,
    pub ship_index: usize,
    pub fleet_len: usize,
    pub formation: Formation,
    pub fleet_los_mod: Option<f64>,
    pub night_situation: NightSituation,
}

impl WarfareAnalyzerShipEnvironment {
    pub fn is_flagship(&self) -> bool {
        self.ship_index == 0
    }
    pub fn is_main_flagship(&self) -> bool {
        self.role.is_main() && self.is_flagship()
    }

    pub fn as_warfare_ship_environment(&self) -> WarfareShipEnvironment {
        let Self {
            org_type,
            role,
            ship_index,
            fleet_len,
            formation,
            fleet_los_mod,
            ..
        } = *self;

        WarfareShipEnvironment {
            org_type,
            role,
            ship_index,
            fleet_len,
            formation,
            fleet_los_mod,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
#[tsify(from_wasm_abi)]
pub struct WarfareAnalyzerContext {
    pub attacker_env: WarfareAnalyzerShipEnvironment,
    pub target_env: WarfareAnalyzerShipEnvironment,
    pub engagement: Engagement,
    pub air_state: AirState,
}

impl WarfareAnalyzerContext {
    pub fn to_warfare_context(&self) -> WarfareContext {
        WarfareContext {
            attacker_env: self.attacker_env.as_warfare_ship_environment(),
            target_env: self.target_env.as_warfare_ship_environment(),
            engagement: self.engagement,
            air_state: self.air_state,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct WarfareInfo {
    day: Option<AttackInfo<DayBattleAttackType, Option<DayCutin>>>,
    closing_torpedo: Option<AttackInfo<(), ()>>,
    night: Option<AttackInfo<NightBattleAttackType, Option<NightCutin>>>,
    shelling_support: Option<AttackInfo<(), ()>>,
    opening_asw: Option<AttackInfo<(), ()>>,
}

pub struct WarfareAnalyzer<'a> {
    config: &'a BattleConfig,
    ctx: &'a WarfareAnalyzerContext,
    attacker: &'a Ship,
    target: &'a Ship,
    warfare_context: WarfareContext,
}

impl<'a> WarfareAnalyzer<'a> {
    pub fn new(
        config: &'a BattleConfig,
        ctx: &'a WarfareAnalyzerContext,
        attacker: &'a Ship,
        target: &'a Ship,
    ) -> Self {
        Self {
            config,
            ctx,
            attacker,
            target,
            warfare_context: ctx.to_warfare_context(),
        }
    }

    fn analyze_asw_attack(&self, attack_type: AswAttackType, time: AswTime) -> AttackStats {
        let asw_ctx = AswAttackContext::new(self.config, &self.warfare_context, attack_type, time);

        asw_ctx
            .attack_params(self.attacker, self.target)
            .into_stats()
    }

    fn analyze_day_battle_attack(&self) -> Option<DayBattleAttackInfo> {
        let attack_type = get_day_battle_attack_type(self.attacker, self.target)?;
        let anti_inst = self.target.is_installation();
        let air_state_rank = self
            .ctx
            .air_state
            .rank(self.ctx.attacker_env.org_type.side());

        let items = match attack_type {
            DayBattleAttackType::Shelling(t) => {
                let day_cutin_rate_info = DayCutinRateInfo::new(
                    &self.config,
                    self.attacker,
                    self.ctx.attacker_env.fleet_los_mod,
                    self.ctx.attacker_env.is_main_flagship(),
                    air_state_rank,
                    anti_inst,
                );

                let items = day_cutin_rate_info
                    .rates
                    .into_iter()
                    .map(|(cutin, rate)| {
                        let sp_def = cutin
                            .and_then(|cutin| self.config.day_cutin.get(&cutin))
                            .map(|def| def.into());

                        let attack_ctx = ShellingAttackContext::new(
                            self.config,
                            &self.warfare_context,
                            t,
                            sp_def,
                        );
                        let stats = attack_ctx
                            .attack_params(self.attacker, self.target)
                            .into_stats();

                        AttackInfoItem { rate, cutin, stats }
                    })
                    .collect::<Vec<_>>();

                items
            }
            DayBattleAttackType::Asw(attack_type) => {
                let stats = self.analyze_asw_attack(attack_type, AswTime::Day);

                let item = AttackInfoItem {
                    cutin: None,
                    rate: Some(1.0),
                    stats,
                };

                vec![item]
            }
        };

        Some(DayBattleAttackInfo::new(attack_type, items))
    }

    fn analyze_night_battle_attack(&self) -> Option<NightBattleAttackInfo> {
        let attack_type = get_night_battle_attack_type(self.attacker, self.target)?;
        let anti_inst = self.target.is_installation();

        let items = match attack_type {
            NightBattleAttackType::NightAttack(attack_type) => {
                let cutin_rate_info = NightCutinRateAnalyzer::new(&self.config)
                    .analyze_cutin_rates(
                        self.attacker,
                        self.ctx.attacker_env.is_flagship(),
                        &self.ctx.attacker_env.night_situation,
                        &self.ctx.target_env.night_situation,
                        anti_inst,
                    );

                let items = cutin_rate_info
                    .rates
                    .into_iter()
                    .map(|(cutin, rate)| {
                        let sp_def = cutin
                            .and_then(|cutin| self.config.night_cutin.get(&cutin))
                            .map(|def| def.into());

                        let attack_ctx = NightAttackContext::new(
                            self.config,
                            &self.warfare_context,
                            &self.ctx.attacker_env.night_situation,
                            &self.ctx.target_env.night_situation,
                            attack_type,
                            sp_def,
                        );

                        let stats = attack_ctx
                            .attack_params(self.attacker, self.target)
                            .into_stats();

                        AttackInfoItem { cutin, rate, stats }
                    })
                    .collect::<Vec<_>>();

                items
            }
            NightBattleAttackType::Asw(attack_type) => {
                let stats = self.analyze_asw_attack(attack_type, AswTime::Night);

                let item = AttackInfoItem {
                    cutin: None,
                    rate: Some(1.0),
                    stats,
                };

                vec![item]
            }
        };

        Some(NightBattleAttackInfo::new(attack_type, items))
    }

    fn analyze_torpedo_attack(&self) -> Option<AttackInfo<(), ()>> {
        if self.attacker.naked_torpedo().unwrap_or_default() == 0
            || self.target.is_submarine()
            || self.target.is_installation()
        {
            return None;
        }

        let torpedo_ctx = TorpedoAttackContext::new(self.config, &self.warfare_context);
        let stats = torpedo_ctx
            .attack_params(self.attacker, self.target)
            .into_stats();

        let item = AttackInfoItem {
            cutin: (),
            rate: Some(1.0),
            stats,
        };

        let info = AttackInfo::new((), vec![item]);
        Some(info)
    }

    fn analyze_shelling_support_attack(&self) -> Option<AttackInfo<(), ()>> {
        if let Some(DayBattleAttackType::Shelling(attack_type)) =
            get_day_battle_attack_type(self.attacker, self.target)
        {
            let shelling_ctx =
                ShellingSupportAttackContext::new(self.config, &self.warfare_context, attack_type);
            let stats = shelling_ctx
                .attack_params(self.attacker, self.target)
                .into_stats();

            let item = AttackInfoItem {
                cutin: (),
                rate: Some(1.0),
                stats,
            };
            let info = AttackInfo::new((), vec![item]);
            Some(info)
        } else {
            None
        }
    }

    fn analyze_opening_asw_attack(&self) -> Option<AttackInfo<(), ()>> {
        let attack_type = get_oasw_attack_type(self.attacker, self.target)?;

        let stats = self.analyze_asw_attack(attack_type, AswTime::Night);

        let item = AttackInfoItem {
            cutin: (),
            rate: Some(1.0),
            stats,
        };

        Some(AttackInfo::new((), vec![item]))
    }

    pub fn analyze(&self) -> WarfareInfo {
        WarfareInfo {
            day: self.analyze_day_battle_attack(),
            night: self.analyze_night_battle_attack(),
            closing_torpedo: self.analyze_torpedo_attack(),
            opening_asw: self.analyze_opening_asw_attack(),
            shelling_support: self.analyze_shelling_support_attack(),
        }
    }
}
