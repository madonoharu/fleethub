use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Tsify)]
pub enum SpeedGroup {
    A,
    B1,
    #[default]
    B2,
    C,
}
