use std::hash::Hash;

use enumset::EnumSet;
use hashbrown::HashMap;
use rand::prelude::*;
use serde::{Deserialize, Serialize};
use serde_with::{serde_as, DefaultOnError};
use tsify::Tsify;

use crate::member::BattleMemberRef;

use super::{
    AttackPowerModifier, AttackType, CompiledEvaler, DayCutin, DayCutinLike, Formation, NightCutin,
    NightCutinLike, NodeState, ShipConditions,
};

#[serde_as]
#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct FormationCombatModifiersDef {
    #[serde_as(as = "DefaultOnError")]
    #[serde(default = "num_traits::one")]
    pub power_mod: f64,
    #[serde_as(as = "DefaultOnError")]
    #[serde(default = "num_traits::one")]
    pub accuracy_mod: f64,
    #[serde_as(as = "DefaultOnError")]
    #[serde(default = "num_traits::one")]
    pub evasion_mod: f64,
}

impl Default for FormationCombatModifiersDef {
    fn default() -> Self {
        Self {
            power_mod: num_traits::one(),
            accuracy_mod: num_traits::one(),
            evasion_mod: num_traits::one(),
        }
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct FormationDef {
    pub tag: Formation,
    pub protection_rate: Option<f64>,
    pub fleet_anti_air_mod: f64,
    pub shelling: FormationCombatModifiersDef,
    pub torpedo: FormationCombatModifiersDef,
    pub asw: FormationCombatModifiersDef,
    pub night: FormationCombatModifiersDef,
    pub support_shelling: FormationCombatModifiersDef,
}

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
#[serde(untagged)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum NestedFormationDef {
    Normal(FormationDef),
    Vanguard {
        top_half: FormationDef,
        bottom_half: FormationDef,
    },
}

impl Default for NestedFormationDef {
    fn default() -> Self {
        Self::Normal(Default::default())
    }
}

impl NestedFormationDef {
    pub fn tag(&self) -> Formation {
        match self {
            Self::Normal(normal) => normal.tag,
            Self::Vanguard { top_half, .. } => top_half.tag,
        }
    }

    pub fn get_def(&self, fleet_len: usize, ship_index: usize) -> &FormationDef {
        match self {
            Self::Normal(normal) => normal,
            Self::Vanguard {
                top_half,
                bottom_half,
            } => {
                let is_top_half = ship_index < fleet_len / 2;
                if is_top_half {
                    top_half
                } else {
                    bottom_half
                }
            }
        }
    }
}

#[serde_as]
#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct AntiAirCutinDef {
    pub id: u8,
    #[serde_as(as = "DefaultOnError")]
    pub type_factor: Option<u8>,
    #[serde_as(as = "DefaultOnError")]
    pub multiplier: Option<f64>,
    #[serde_as(as = "DefaultOnError")]
    pub guaranteed: Option<u8>,
    pub sequential: Option<bool>,
}

impl AntiAirCutinDef {
    pub fn rate(&self) -> Option<f64> {
        Some(self.type_factor? as f64 / 100.0)
    }

    pub fn is_sequential(&self) -> bool {
        self.sequential.unwrap_or_default()
    }
}

#[serde_as]
#[derive(Debug, Default, Clone, Deserialize, Tsify)]
#[tsify(from_wasm_abi)]
pub struct DayCutinDef {
    pub tag: DayCutin,
    pub hits: u8,
    #[serde_as(as = "DefaultOnError")]
    pub type_factor: Option<u8>,
    #[serde_as(as = "DefaultOnError")]
    pub power_mod: Option<f64>,
    #[serde_as(as = "DefaultOnError")]
    pub accuracy_mod: Option<f64>,
}

pub struct CutinModifiers {
    pub power_mod: f64,
    pub accuracy_mod: f64,
}

impl Default for CutinModifiers {
    fn default() -> Self {
        Self {
            power_mod: 1.0,
            accuracy_mod: 1.0,
        }
    }
}

impl DayCutinDef {
    pub fn rate(&self, observation_term: f64) -> f64 {
        let type_factor = self.type_factor.unwrap_or_default() as f64;
        (observation_term / type_factor).min(1.0)
    }

    pub fn gen_bool<R: Rng + ?Sized>(&self, observation_term: f64, rng: &mut R) -> bool {
        let type_factor = self.type_factor.unwrap_or_default();
        let a = rng.gen_range(0..type_factor);
        observation_term > a as f64
    }
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
#[serde(default)]
pub struct HistoricalBonusDef {
    map: i16,
    node: CompiledEvaler,
    phase: u8,
    debuff: bool,
    ship: CompiledEvaler,
    enemy: CompiledEvaler,
    pub power_mod: AttackPowerModifier,
    pub armor_penetration: f64,
    #[serde(default = "num_traits::one")]
    pub accuracy_mod: f64,
    #[serde(default = "num_traits::one")]
    pub evasion_mod: f64,
}

impl HistoricalBonusDef {
    pub fn matches(
        &self,
        node_state: NodeState,
        ship: &BattleMemberRef,
        enemy: &BattleMemberRef,
    ) -> bool {
        self.map == node_state.map
            && (self.node.is_empty() || self.node.matches(&mut node_state.node.ns()))
            && (self.phase == 0 || self.phase == node_state.phase)
            && (!self.debuff || self.debuff == node_state.debuff)
            && (self.ship.is_empty() || self.ship.matches(&mut ship.ns()))
            && (self.enemy.is_empty() || self.enemy.matches(&mut enemy.ns()))
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Tsify)]
pub struct HistoricalParams {
    pub power_mod: AttackPowerModifier,
    pub armor_penetration: f64,
    pub accuracy_mod: f64,
    pub target_evasion_mod: f64,
}

impl Default for HistoricalParams {
    fn default() -> Self {
        Self {
            power_mod: Default::default(),
            armor_penetration: 0.0,
            accuracy_mod: 1.0,
            target_evasion_mod: 1.0,
        }
    }
}

#[serde_as]
#[derive(Debug, Default, Clone, Deserialize, Tsify)]
#[tsify(from_wasm_abi)]
pub struct NightCutinDef {
    pub tag: NightCutin,
    pub hits: f64,
    #[serde_as(as = "DefaultOnError")]
    pub type_factor: Option<u8>,
    #[serde_as(as = "DefaultOnError")]
    pub power_mod: Option<f64>,
    #[serde_as(as = "DefaultOnError")]
    pub accuracy_mod: Option<f64>,
}

impl NightCutinDef {
    pub fn to_modifiers(&self) -> CutinModifiers {
        CutinModifiers {
            power_mod: self.power_mod.unwrap_or(1.0),
            accuracy_mod: self.accuracy_mod.unwrap_or(1.0),
        }
    }

    pub fn rate(&self, cutin_term: f64) -> Option<f64> {
        let rate = if self.tag == NightCutin::DoubleAttack {
            109.0 / 110.0
        } else {
            (cutin_term.ceil() / self.type_factor? as f64).min(1.0)
        };

        Some(rate)
    }
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct BattleDefinitions {
    pub formation: HashMap<Formation, NestedFormationDef>,
    pub anti_air_cutin: HashMap<u8, AntiAirCutinDef>,
    pub day_cutin: HashMap<DayCutin, DayCutinDef>,
    pub night_cutin: HashMap<NightCutin, NightCutinDef>,
    pub historical_bonuses: Vec<HistoricalBonusDef>,
}

impl BattleDefinitions {
    pub fn get_formation_def(
        &self,
        formation: Formation,
        fleet_len: usize,
        ship_index: usize,
    ) -> &FormationDef {
        let nfd = self
            .formation
            .get(&formation)
            .unwrap_or_else(|| unreachable!());
        nfd.get_def(fleet_len, ship_index)
    }

    pub fn get_historical_params(
        &self,
        node_state: NodeState,
        attacker: &BattleMemberRef,
        target: &BattleMemberRef,
    ) -> HistoricalParams {
        let mut params = HistoricalParams::default();

        if node_state.map == 0 || node_state.disable_historical_mod {
            return params;
        }

        if attacker.position.org_type.is_player() {
            self.historical_bonuses
                .iter()
                .filter(|def| def.matches(node_state, attacker, target))
                .for_each(|def| {
                    params.power_mod.merge(def.power_mod.a, def.power_mod.b);
                    params.armor_penetration += def.armor_penetration;
                    params.accuracy_mod *= def.accuracy_mod;
                })
        } else {
            self.historical_bonuses
                .iter()
                .filter(|def| def.matches(node_state, target, attacker))
                .for_each(|def| {
                    params.target_evasion_mod *= def.evasion_mod;
                })
        };

        params
    }

    pub fn get_formation_fleet_anti_air_mod(&self, formation: Formation) -> f64 {
        self.get_formation_def(formation, 0, 6).fleet_anti_air_mod
    }

    pub fn get_day_cutin(&self, cutin: Option<DayCutin>) -> Option<&DayCutinDef> {
        self.day_cutin.get(&cutin?)
    }

    pub fn get_night_cutin_defs(
        &self,
        set: EnumSet<NightCutin>,
    ) -> impl Iterator<Item = &NightCutinDef> {
        set.into_iter()
            .filter_map(|cutin| self.night_cutin.get(&cutin))
    }

    pub fn get_formation_params<T: Into<AttackType>>(
        &self,
        attack_type: T,
        attacker: ShipConditions,
        target: ShipConditions,
    ) -> FormationParams {
        let attack_type = attack_type.into();

        let attacker_def = self.get_formation_def(
            attacker.formation,
            attacker.position.fleet_len,
            attacker.position.index,
        );
        let target_def = self.get_formation_def(
            target.formation,
            target.position.fleet_len,
            target.position.index,
        );

        let (attacker_mods, target_mods) = match attack_type {
            AttackType::Shelling(_) => (&attacker_def.shelling, &target_def.shelling),
            AttackType::Asw(_) => (&attacker_def.asw, &target_def.asw),
            AttackType::Night(_) => (&attacker_def.night, &target_def.night),
            AttackType::Torpedo => (&attacker_def.torpedo, &target_def.torpedo),
            AttackType::SupportShelling(_) => {
                (&attacker_def.support_shelling, &target_def.support_shelling)
            }
        };

        let cancels = cancels_formation_modifier(attack_type, attacker.formation, target.formation);

        let power_mod = attacker_mods.power_mod;
        let accuracy_mod = if cancels {
            1.0
        } else {
            attacker_mods.accuracy_mod
        };

        let target_evasion_mod = target_mods.evasion_mod;

        FormationParams {
            power_mod,
            accuracy_mod,
            target_evasion_mod,
        }
    }

    pub fn get_flagship_protection_rate(&self, formation: Formation) -> f64 {
        let def = self.get_formation_def(formation, 6, 0);
        def.protection_rate.unwrap_or(0.6)
    }
}

#[derive(Debug, Clone, Copy)]
pub struct FormationParams {
    pub power_mod: f64,
    pub accuracy_mod: f64,
    pub target_evasion_mod: f64,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct SpecialAttackDef<T> {
    pub kind: T,
    pub power_mod: f64,
    pub accuracy_mod: f64,
    pub hits: f64,
}

impl<T: PartialEq> PartialEq for SpecialAttackDef<T> {
    fn eq(&self, other: &Self) -> bool {
        self.kind == other.kind
    }
}

impl<T: Eq> Eq for SpecialAttackDef<T> {}

impl<T: Hash> Hash for SpecialAttackDef<T> {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.kind.hash(state)
    }
}

impl From<&DayCutinDef> for SpecialAttackDef<DayCutinLike> {
    fn from(def: &DayCutinDef) -> Self {
        Self {
            kind: def.tag.into(),
            power_mod: def.power_mod.unwrap_or(1.0),
            accuracy_mod: def.accuracy_mod.unwrap_or(1.0),
            hits: def.hits.into(),
        }
    }
}

impl From<&NightCutinDef> for SpecialAttackDef<NightCutinLike> {
    fn from(def: &NightCutinDef) -> Self {
        Self {
            kind: def.tag.into(),
            power_mod: def.power_mod.unwrap_or(1.0),
            accuracy_mod: def.accuracy_mod.unwrap_or(1.0),
            hits: def.hits,
        }
    }
}

/// 陣形相性
///
/// 砲撃戦と対潜戦では攻撃側と防御側は以下の陣形条件を満たすなら命中補正は1.0となる
/// - 複縦 → 単横
/// - 単横 → 梯形
/// - 梯形 → 単縦
fn cancels_formation_modifier(
    attack_type: AttackType,
    attacker_formation: Formation,
    target_formation: Formation,
) -> bool {
    use super::SingleFormation::*;

    if !matches!(
        attack_type,
        AttackType::Shelling(_) | AttackType::SupportShelling(_) | AttackType::Asw(_)
    ) {
        return false;
    }

    match (attacker_formation, target_formation) {
        (Formation::Single(a), Formation::Single(b)) => {
            matches!(
                (a, b),
                (DoubleLine, LineAbreast) | (LineAbreast, Echelon) | (Echelon, LineAhead)
            )
        }
        _ => false,
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_cancels_formation_modifier() {
        let attack_types = [
            AttackType::Shelling(Default::default()),
            AttackType::Asw(Default::default()),
            AttackType::Night(Default::default()),
            AttackType::Torpedo,
            AttackType::SupportShelling(Default::default()),
        ];

        let ineffective_pairs = [
            (Formation::DOUBLE_LINE, Formation::LINE_ABREAST),
            (Formation::LINE_ABREAST, Formation::ECHELON),
            (Formation::ECHELON, Formation::LINE_AHEAD),
        ];

        attack_types
            .into_iter()
            .flat_map(|ty| {
                Formation::iter().flat_map(move |f1| Formation::iter().map(move |f2| (ty, f1, f2)))
            })
            .for_each(|(attack_type, f1, f2)| {
                let expected = if attack_type.is_shelling()
                    || attack_type.is_asw()
                    || attack_type.is_support_shelling()
                {
                    ineffective_pairs
                        .iter()
                        .any(|pair| pair.0 == f1 && pair.1 == f2)
                } else {
                    false
                };

                assert_eq!(
                    cancels_formation_modifier(attack_type, f1, f2),
                    expected,
                    "{:#?}",
                    (attack_type, f1, f2)
                )
            });
    }
}
