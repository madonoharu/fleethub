use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::{FleetType, OrgType, Role, Side};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Tsify)]
#[serde(default)]
pub struct ShipPosition {
    pub org_type: OrgType,
    pub fleet_type: FleetType,
    pub fleet_len: usize,
    pub index: usize,
}

impl Default for ShipPosition {
    fn default() -> Self {
        Self {
            org_type: Default::default(),
            fleet_type: Default::default(),
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

    pub fn role(self) -> Role {
        self.fleet_type.into()
    }

    pub fn is_main(self) -> bool {
        self.role().is_main()
    }

    pub fn is_main_flagship(self) -> bool {
        self.role().is_main() && self.index == 0
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
