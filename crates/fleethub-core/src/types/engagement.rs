use serde::{Deserialize, Serialize};
use strum::EnumIter;
use tsify::Tsify;

#[derive(
    Debug, Default, Clone, Copy, Hash, PartialEq, Eq, EnumIter, Serialize, Deserialize, Tsify,
)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum Engagement {
    /// T有利
    GreenT,
    /// 同航戦
    #[default]
    Parallel,
    /// 反航戦
    HeadOn,
    /// T不利
    RedT,
}

impl Engagement {
    pub fn modifier(&self) -> f64 {
        match self {
            Self::Parallel => 1.0,
            Self::HeadOn => 0.8,
            Self::GreenT => 1.2,
            Self::RedT => 0.6,
        }
    }
}
