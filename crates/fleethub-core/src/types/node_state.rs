use arrayvec::ArrayString;
use serde::{Deserialize, Serialize};
use serde_with::{serde_as, DefaultOnError};
use tsify::Tsify;

#[serde_as]
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Tsify)]
#[serde(transparent)]
pub struct NodeId(
    #[serde_as(as = "DefaultOnError")]
    #[tsify(type = "string")]
    ArrayString<3>,
);

impl NodeId {
    pub const fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
}

#[derive(Debug, Default, Clone, Copy, Serialize, Deserialize, Tsify)]
#[serde(default)]
pub struct NodeState {
    pub map: i16,
    pub node: NodeId,
    pub phase: u8,
    pub debuff: bool,
}
