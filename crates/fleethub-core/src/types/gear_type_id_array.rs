use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::{
    convert::{FromWasmAbi, IntoWasmAbi},
    describe::WasmDescribe,
    prelude::*,
};

use super::GearType;

#[derive(Debug, Default, Clone, Serialize, Deserialize, Tsify)]
#[serde(transparent)]
pub struct GearTypeIdArray {
    array: [u8; 5],
}

impl WasmDescribe for GearTypeIdArray {
    fn describe() {
        <Vec<u8> as WasmDescribe>::describe()
    }
}

impl IntoWasmAbi for GearTypeIdArray {
    type Abi = <Vec<u8> as IntoWasmAbi>::Abi;

    fn into_abi(self) -> Self::Abi {
        <Vec<u8> as IntoWasmAbi>::into_abi(self.into())
    }
}

impl FromWasmAbi for GearTypeIdArray {
    type Abi = <Vec<u8> as FromWasmAbi>::Abi;

    unsafe fn from_abi(js: Self::Abi) -> Self {
        let vec = unsafe { <Vec<u8> as FromWasmAbi>::from_abi(js) };
        Self::from(vec)
    }
}

impl GearTypeIdArray {
    pub fn get(&self, index: usize) -> Option<u8> {
        self.array.get(index).copied()
    }

    pub fn gear_type_id(&self) -> u8 {
        self.array[2]
    }

    pub fn gear_type(&self) -> GearType {
        num_traits::FromPrimitive::from_u8(self.gear_type_id()).unwrap_or_default()
    }

    pub fn icon_id(&self) -> u8 {
        self.array[3]
    }
}

impl From<[u8; 5]> for GearTypeIdArray {
    #[inline]
    fn from(array: [u8; 5]) -> Self {
        Self { array }
    }
}

impl From<GearTypeIdArray> for Vec<u8> {
    #[inline]
    fn from(input: GearTypeIdArray) -> Self {
        input.array.into()
    }
}

impl From<Vec<u8>> for GearTypeIdArray {
    fn from(input: Vec<u8>) -> Self {
        let mut array = [0; 5];
        array[..input.len()].copy_from_slice(&input);

        array.into()
    }
}

#[cfg(test)]
mod tests {
    use super::GearTypeIdArray;

    #[test]
    fn pads_short_inputs_and_preserves_five_type_ids() {
        for (input, expected) in [
            (vec![], [0; 5]),
            (vec![1, 2, 3], [1, 2, 3, 0, 0]),
            (vec![1, 2, 3, 4, 5], [1, 2, 3, 4, 5]),
        ] {
            let result = GearTypeIdArray::from(input);

            assert_eq!(Vec::from(result), expected);
        }
    }

    #[test]
    #[should_panic]
    fn rejects_more_than_five_type_ids() {
        let _ = GearTypeIdArray::from(vec![1, 2, 3, 4, 5, 6]);
    }
}
