use fh_macro::FhAbi;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize, TS, FhAbi,
)]
pub enum FleetType {
    Main,
    Escort,
    RouteSup,
    BossSup,
}
