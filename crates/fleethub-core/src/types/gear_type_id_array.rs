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
        let vec = <Vec<u8> as FromWasmAbi>::from_abi(js);
        Self::from(vec)
    }
}

impl GearTypeIdArray {
    pub fn get(&self, index: usize) -> Option<u8> {
        self.array.get(index).cloned()
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
        let array = input
            .into_iter()
            .enumerate()
            .fold([0_u8; 5], |mut acc, (i, v)| {
                acc[i] = v;
                acc
            });

        array.into()
    }
}
