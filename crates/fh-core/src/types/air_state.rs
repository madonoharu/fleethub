use fh_macro::FhAbi;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Copy, Hash, Serialize, Deserialize, TS, FhAbi)]
pub enum AirState {
    /// 制空確保
    AirSupremacy,
    /// 制空優勢
    AirSuperiority,
    /// 制空均衡
    AirParity,
    /// 制空劣勢
    AirDenial,
    /// 制空喪失
    AirIncapability,
}

impl Default for AirState {
    fn default() -> Self {
        Self::AirSupremacy
    }
}

impl AirState {
    pub fn contact_mod(self) -> f64 {
        match self {
            AirState::AirSupremacy => 3.0,
            AirState::AirSuperiority => 2.0,
            AirState::AirDenial => 1.0,
            _ => 0.0,
        }
    }
}
