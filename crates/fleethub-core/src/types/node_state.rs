use std::{ops::Deref, str::FromStr};

use arrayvec::{ArrayString, CapacityError};
use fasteval::{bool_to_f64, EvalNamespace};
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
    pub fn ns(&self) -> impl EvalNamespace + '_ {
        |name: &str, _args: Vec<f64>| -> Option<f64> { Some(bool_to_f64!(self.as_str() == name)) }
    }
}

impl Deref for NodeId {
    type Target = ArrayString<3>;

    #[inline]
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl FromStr for NodeId {
    type Err = CapacityError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(NodeId(ArrayString::from_str(s)?))
    }
}

#[serde_as]
#[derive(Debug, Default, Clone, Copy, Serialize, Deserialize, Tsify)]
#[serde(default)]
pub struct NodeState {
    #[serde_as(as = "DefaultOnError")]
    pub map: i16,
    pub node: NodeId,
    #[serde_as(as = "DefaultOnError")]
    pub phase: u8,
    pub debuff: bool,
    pub disable_historical_mod: bool,
    pub landing_battle: bool,
}

impl NodeState {
    pub fn is_event(self) -> bool {
        self.map >= 100
    }
}
