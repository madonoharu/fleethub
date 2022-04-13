use std::ops::{Deref, DerefMut};

use arrayvec::ArrayVec;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

const SLOT_SIZE_VEC_CAPACITY: usize = 5;

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(transparent)]
pub struct SlotSizeVec {
    #[tsify(type = "(number | null)[]")]
    vec: ArrayVec<Option<u8>, SLOT_SIZE_VEC_CAPACITY>,
}

impl Deref for SlotSizeVec {
    type Target = ArrayVec<Option<u8>, SLOT_SIZE_VEC_CAPACITY>;

    #[inline]
    fn deref(&self) -> &Self::Target {
        &self.vec
    }
}

impl DerefMut for SlotSizeVec {
    #[inline]
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.vec
    }
}

impl FromIterator<Option<u8>> for SlotSizeVec {
    fn from_iter<T: IntoIterator<Item = Option<u8>>>(iter: T) -> Self {
        Self {
            vec: iter.into_iter().collect(),
        }
    }
}

impl SlotSizeVec {
    pub fn with_slotnum(self, slotnum: usize) -> Self {
        let len = self
            .iter()
            .rposition(|v| v.is_some())
            .map(|i| i + 1)
            .unwrap_or_default()
            .max(slotnum);

        self.vec.into_iter().take(len).collect()
    }
}
