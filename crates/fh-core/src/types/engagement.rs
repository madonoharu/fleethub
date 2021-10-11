use fh_macro::FhAbi;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, Serialize, Deserialize, TS, FhAbi)]
pub enum Engagement {
    /// T有利
    GreenT,
    /// 同航戦
    Parallel,
    /// 反航戦
    HeadOn,
    /// T不利
    RedT,
}

impl Default for Engagement {
    fn default() -> Self {
        Self::Parallel
    }
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
