use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    analyzer::{AttackInfoItem, DayCutinRateInfo},
    attack::{
        get_day_battle_attack_type, AswAttackContext, DayBattleAttackType, NightBattleAttackType,
        ShellingAttackType,
    },
    attack2::asw::FormationParams,
    ship::Ship,
    types::{
        AirState, BattleDefinitions, DayCutin, Engagement, FormationDef, NightCutin,
        ShipEnvironment, Side,
    },
};

use crate::attack2::asw::{AswAttackParams, AswAttackType, AswTime};

use super::{AttackInfo, AttackStats};

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

#[derive(Debug, Clone, Copy)]
enum AttackType {
    Asw(AswAttackType),
    Night(NightBattleAttackType),
    Shelling(ShellingAttackType),
}

impl From<AswAttackType> for AttackType {
    fn from(t: AswAttackType) -> Self {
        Self::Asw(t)
    }
}

pub struct WarfareAnalyzerContext {
    pub battle_defs: BattleDefinitions,
    pub engagement: Engagement,
    pub air_state: AirState,
    pub player_env: ShipEnvironment,
    pub enemy_env: ShipEnvironment,
}

impl WarfareAnalyzerContext {
    fn env(&self, side: Side) -> &ShipEnvironment {
        if side.is_player() {
            &self.player_env
        } else {
            &self.enemy_env
        }
    }

    pub fn get_formation_def(&self, side: Side) -> &FormationDef {
        self.battle_defs.get_formation_def_by_env(self.env(side))
    }

    fn formation_params(&self, attacker_side: Side, attack_type: AttackType) -> FormationParams {
        let attacker_formation_def = self.get_formation_def(attacker_side);
        let attacker_formation = attacker_formation_def.tag;
        let target_formation_def = self.get_formation_def(attacker_side.not());
        let target_formation = target_formation_def.tag;

        let (attacker_mods, target_mods) = match attack_type {
            AttackType::Shelling(_) => (
                &attacker_formation_def.shelling,
                &target_formation_def.shelling,
            ),
            AttackType::Asw(_) => (&attacker_formation_def.asw, &target_formation_def.asw),
            AttackType::Night(_) => (&attacker_formation_def.night, &target_formation_def.night),
        };

        let power_mod = attacker_mods.power_mod.unwrap_or(1.0);
        let accuracy_mod = if attacker_formation.is_ineffective(target_formation) {
            1.0
        } else {
            attacker_mods.accuracy_mod.unwrap_or(1.0)
        };

        let target_evasion_mod = target_mods.evasion_mod.unwrap_or(1.0);

        FormationParams {
            power_mod,
            accuracy_mod,
            target_evasion_mod,
        }
    }
}

pub struct WarfareAnalyzer<'a> {
    ctx: &'a WarfareAnalyzerContext,
    player_ship: &'a Ship,
    enemy_ship: &'a Ship,
}

impl WarfareAnalyzer<'_> {
    fn analyze_asw_attack(
        &self,
        attacker_side: Side,
        attack_type: AswAttackType,
        time: AswTime,
    ) -> AttackStats {
        let (attacker, target) = if attacker_side.is_player() {
            (self.player_ship, self.enemy_ship)
        } else {
            (self.enemy_ship, self.player_ship)
        };

        let formation_params = self.ctx.formation_params(attacker_side, attack_type.into());

        let asw_attack_params = AswAttackParams {
            time,
            attack_type,
            engagement: self.ctx.engagement,
            formation_power_mod: formation_params.power_mod,
            formation_accuracy_mod: formation_params.accuracy_mod,
            formation_evasion_mod: formation_params.target_evasion_mod,
            attacker_side,
            attacker,
            target,
        };

        asw_attack_params.attack_params().into_stats()
    }
}
