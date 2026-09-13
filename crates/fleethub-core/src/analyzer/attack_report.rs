use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::attack::{Attack, AttackParams, AttackPower, AttackPowerParams, HitRate, HitRateParams};

use super::{DamageReport, DensityDetail};

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
pub struct AttackReport<T> {
    pub style: T,
    pub proc_rate: Option<f64>,
    pub attack_power: Option<AttackPower>,
    pub attack_power_params: Option<AttackPowerParams>,
    pub hits: f64,
    pub hit_rate: Option<HitRate>,
    pub hit_rate_params: Option<HitRateParams>,
    pub damage: Option<DamageReport>,
}

impl<T> AttackReport<T> {
    pub fn new(style: T, proc_rate: Option<f64>, params: AttackParams) -> Self {
        Self::with_density_detail(style, proc_rate, params, DensityDetail::Total)
    }

    pub fn with_density_detail(
        style: T,
        proc_rate: Option<f64>,
        params: AttackParams,
        detail: DensityDetail,
    ) -> Self {
        let attack = params.calc_attack();
        let damage = DamageReport::new(&attack, detail);

        let AttackParams {
            attack_power_params,
            hit_rate_params,
            ..
        } = params;

        let Attack {
            attack_power,
            hits,
            hit_rate,
            ..
        } = attack;

        AttackReport {
            style,
            proc_rate,
            attack_power,
            attack_power_params,
            hits,
            hit_rate,
            hit_rate_params,
            damage,
        }
    }
}
