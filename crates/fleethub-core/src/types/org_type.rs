use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::{Formation, Side};

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub enum OrgType {
    /// 通常艦隊
    #[default]
    Single,
    /// 空母機動部隊
    CarrierTaskForce,
    /// 水上打撃部隊
    SurfaceTaskForce,
    /// 輸送護衛部隊
    TransportEscort,
    /// 敵通常
    EnemySingle,
    /// 敵連合
    EnemyCombined,
}

impl OrgType {
    pub fn is_single(self) -> bool {
        matches!(self, Self::Single | Self::EnemySingle)
    }

    pub fn is_combined(self) -> bool {
        !self.is_single()
    }

    pub fn default_formation(self) -> Formation {
        if self.is_combined() {
            Formation::Combined(Default::default())
        } else {
            Formation::Single(Default::default())
        }
    }

    pub fn side(self) -> Side {
        match self {
            Self::Single
            | Self::CarrierTaskForce
            | Self::SurfaceTaskForce
            | Self::TransportEscort => Side::Player,
            Self::EnemySingle | Self::EnemyCombined => Side::Enemy,
        }
    }

    #[inline]
    pub fn is_player(self) -> bool {
        self.side().is_player()
    }

    #[inline]
    pub fn is_enemy(self) -> bool {
        !self.is_player()
    }
}
