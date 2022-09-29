use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Default, Clone, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct GearState {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,

    pub gear_id: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exp: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stars: Option<u8>,
}

#[derive(Debug, Default, Clone, Hash, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct GearVecState {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub g1: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub g2: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub g3: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub g4: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub g5: Option<GearState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub gx: Option<GearState>,
}

impl GearVecState {
    pub fn iter(&self) -> impl Iterator<Item = Option<&GearState>> {
        let Self {
            g1,
            g2,
            g3,
            g4,
            g5,
            gx,
        } = self;
        [g1, g2, g3, g4, g5, gx].into_iter().map(|g| g.as_ref())
    }
}

impl IntoIterator for GearVecState {
    type Item = Option<GearState>;
    type IntoIter = std::array::IntoIter<Self::Item, 6>;

    fn into_iter(self) -> Self::IntoIter {
        let Self {
            g1,
            g2,
            g3,
            g4,
            g5,
            gx,
        } = self;

        [g1, g2, g3, g4, g5, gx].into_iter()
    }
}
