use hashbrown::HashMap;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

use crate::{
    attack::AttackParams,
    types::{AttackStyleKey, DamageState},
    utils::Histogram,
};

use super::AttackReport;

#[derive(Debug, Clone, Serialize, Deserialize, Tsify)]
pub struct ActionReport<T: AttackStyleKey> {
    pub data: HashMap<String, AttackReport<T>>,
    pub damage_state_density: Option<Histogram<DamageState, f64>>,
    pub is_active: bool,
}

impl<T: AttackStyleKey> ActionReport<T> {
    pub fn empty() -> Self {
        Self {
            data: HashMap::new(),
            damage_state_density: None,
            is_active: false,
        }
    }

    pub fn one(style: T, params: AttackParams) -> Self {
        let report = AttackReport::new(style, Some(1.0), params);
        Self::new(vec![report])
    }

    pub fn new(vec: Vec<AttackReport<T>>) -> Self {
        if vec.is_empty() {
            return Self::empty();
        }

        let damage_state_density = vec.iter().try_fold(Histogram::new(), |mut hist, current| {
            let proc_rate = current.proc_rate?;
            current
                .damage
                .as_ref()?
                .damage_state_density
                .iter()
                .for_each(|(k, v)| {
                    hist += (*k, v * proc_rate);
                });
            Some(hist)
        });

        let data = vec
            .into_iter()
            .map(|report| (report.style.key(), report))
            .collect();

        Self {
            data,
            damage_state_density,
            is_active: true,
        }
    }
}
