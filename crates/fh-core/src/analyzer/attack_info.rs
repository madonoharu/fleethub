use serde::Serialize;
use ts_rs::TS;

use crate::{
    attack::{AttackParams, AttackPower, AttackPowerParams, HitRate, HitRateParams},
    types::DamageState,
    utils::NumMap,
};

use super::{DamageAnalyzer, DamageInfo};

#[derive(Debug, Serialize, TS)]
pub struct AttackStats {
    pub attack_power: Option<AttackPower>,
    pub attack_power_params: Option<AttackPowerParams>,
    pub hits: f64,
    pub hit_rate: Option<HitRate>,
    pub hit_rate_params: Option<HitRateParams>,
    pub damage: Option<DamageInfo>,
}

impl AttackParams {
    pub fn into_stats(self) -> AttackStats {
        let Self {
            attack_power_params,
            hit_rate_params,
            defense_params,
            hits,
            is_cutin,
        } = self;

        let attack_power = attack_power_params.as_ref().map(|p| p.calc());
        let hit_rate = hit_rate_params.as_ref().map(|p| p.calc());

        let get_damage_info = || -> Option<DamageInfo> {
            let damage_analyzer = DamageAnalyzer {
                attack_power: attack_power.as_ref(),
                defense_params: defense_params.as_ref(),
                hit_rate: hit_rate.as_ref(),
                hits,
                is_cutin,
            };

            damage_analyzer.analyze()
        };

        let damage = get_damage_info();

        AttackStats {
            attack_power,
            attack_power_params,
            hits,
            hit_rate,
            hit_rate_params,
            damage,
        }
    }
}

#[derive(Debug, Serialize, TS)]
pub struct AttackInfoItem<Cutin>
where
    Cutin: Serialize + TS,
{
    pub cutin: Cutin,
    pub rate: Option<f64>,
    pub stats: AttackStats,
}

#[derive(Debug, Serialize, TS)]
pub struct AttackInfo<AttackType, Cutin>
where
    AttackType: Serialize + TS,
    Cutin: Serialize + TS,
{
    pub attack_type: AttackType,
    pub items: Vec<AttackInfoItem<Cutin>>,
    // ts_rsがうまく動かないので`Option<NumMap<DamageState, f64>>`を断念
    pub damage_state_map: NumMap<DamageState, f64>,
    pub damage_state_map_is_empty: bool,
}

impl<AttackType, Cutin> AttackInfo<AttackType, Cutin>
where
    AttackType: Serialize + TS,
    Cutin: Serialize + TS,
{
    pub fn new(attack_type: AttackType, items: Vec<AttackInfoItem<Cutin>>) -> Self {
        let damage_state_map = items
            .iter()
            .map(|item| {
                let rate = item.rate?;
                Some(item.stats.damage.as_ref()?.damage_state_map.clone() * rate)
            })
            .sum::<Option<NumMap<DamageState, f64>>>()
            .unwrap_or_else(|| NumMap::new());

        let damage_state_map_is_empty = damage_state_map.is_empty();

        Self {
            attack_type,
            items,
            damage_state_map,
            damage_state_map_is_empty,
        }
    }
}
