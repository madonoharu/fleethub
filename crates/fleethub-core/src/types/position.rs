use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::{OrgType, Role, ShipEnvironment, Side};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Tsify)]
#[serde(default)]
pub struct ShipPosition {
    pub org_type: OrgType,
    pub role: Role,
    pub fleet_len: usize,
    pub index: usize,
}

impl Default for ShipPosition {
    fn default() -> Self {
        Self {
            org_type: Default::default(),
            role: Default::default(),
            fleet_len: 6,
            index: Default::default(),
        }
    }
}

impl ShipPosition {
    pub fn side(self) -> Side {
        self.org_type.side()
    }

    pub fn is_flagship(self) -> bool {
        self.index == 0
    }

    pub fn vertical_position(self) -> VerticalPosition {
        VerticalPosition::new(self.fleet_len, self.index)
    }

    pub fn is_top_half(self) -> bool {
        matches!(self.vertical_position(), VerticalPosition::TopHalf)
    }

    pub fn is_main(self) -> bool {
        self.role.is_main()
    }

    pub fn is_main_flagship(self) -> bool {
        self.role.is_main() && self.index == 0
    }
}

#[derive(Debug, Clone, Copy)]
pub struct FleetPosition {
    pub org_type: OrgType,
    pub role: Role,
}

impl From<ShipPosition> for FleetPosition {
    fn from(value: ShipPosition) -> Self {
        Self {
            org_type: value.org_type,
            role: value.role,
        }
    }
}

impl From<&ShipEnvironment> for FleetPosition {
    fn from(env: &ShipEnvironment) -> Self {
        Self {
            org_type: env.org_type,
            role: env.role,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum VerticalPosition {
    TopHalf,
    BottomHalf,
}

impl VerticalPosition {
    pub fn new(fleet_len: usize, index: usize) -> Self {
        if index < fleet_len / 2 {
            Self::TopHalf
        } else {
            Self::BottomHalf
        }
    }
}
