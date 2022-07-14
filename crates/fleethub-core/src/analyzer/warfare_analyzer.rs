use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    attack::{
        get_day_battle_attack_type, get_night_battle_attack_type, get_oasw_attack_type,
        AswAttackContext, AswAttackType, AswTime, DayBattleAttackType, NightAttackContext,
        NightBattleAttackType, ShellingAttackContext, ShellingSupportAttackContext,
        TorpedoAttackContext, WarfareContext,
    },
    ship::Ship,
    types::{AirState, BattleDefinitions, DayCutin, Engagement, NightCutin, ShipEnvironment},
};

use super::{AttackInfo, AttackInfoItem, AttackStats, DayCutinRateInfo, NightCutinRateAnalyzer};

pub type DayBattleAttackInfo = AttackInfo<DayBattleAttackType, Option<DayCutin>>;
pub type NightBattleAttackInfo = AttackInfo<NightBattleAttackType, Option<NightCutin>>;
pub type TorpedoAttackInfo = AttackInfo<(), ()>;

#[derive(Debug, Serialize, Tsify)]
struct AttackAnalysisResult {
    day: Option<AttackInfo<DayBattleAttackType, Option<DayCutin>>>,
    closing_torpedo: Option<AttackInfo<(), ()>>,
    night: Option<AttackInfo<NightBattleAttackType, Option<NightCutin>>>,
    shelling_support: Option<AttackInfo<(), ()>>,
    opening_asw: Option<AttackInfo<(), ()>>,
}

#[derive(Debug, Serialize, Tsify)]
#[tsify(into_wasm_abi)]
pub struct WarfareAnalysisResult {
    player: AttackAnalysisResult,
    enemy: AttackAnalysisResult,
}

pub struct WarfareAnalyzerContext {
    pub battle_defs: BattleDefinitions,
    pub engagement: Engagement,
    pub air_state: AirState,
    pub player_env: ShipEnvironment,
    pub enemy_env: ShipEnvironment,
}

pub struct WarfareAnalyzer<'a> {
    ctx: &'a WarfareAnalyzerContext,
    player: &'a Ship,
    enemy: &'a Ship,
}
