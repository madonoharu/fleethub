use std::ops::{Deref, DerefMut};

use arrayvec::ArrayVec;
use serde::{Deserialize, Serialize};
use tsify::Tsify;

const SLOT_SIZE_VEC_CAPACITY: usize = 5;

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
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
    pub fn with_slotnum(mut self, slotnum: usize) -> Self {
        let len = self
            .iter()
            .rposition(|v| v.is_some())
            .map_or(0, |i| i + 1)
            .max(slotnum);

        self.vec.truncate(len);
        self
    }
}

#[cfg(test)]
mod tests {
    use super::SlotSizeVec;

    #[test]
    fn preserves_occupied_slots_and_requested_empty_slots() {
        let slots = [Some(18), None, Some(0), None, None];

        for (slotnum, expected_len) in [(0, 3), (1, 3), (4, 4), (5, 5), (6, 5)] {
            let result = slots
                .into_iter()
                .collect::<SlotSizeVec>()
                .with_slotnum(slotnum);

            assert_eq!(result.as_slice(), &slots[..expected_len]);
        }
    }

    #[test]
    fn trims_all_empty_slots_without_padding() {
        let slots = [None; 5];

        for (slotnum, expected_len) in [(0, 0), (2, 2), (6, 5)] {
            let result = slots
                .into_iter()
                .collect::<SlotSizeVec>()
                .with_slotnum(slotnum);

            assert_eq!(result.as_slice(), &slots[..expected_len]);
        }
    }
}
