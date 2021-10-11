use quote::quote;
use syn::{parse_macro_input, DeriveInput};

#[proc_macro_derive(FhAbi)]
pub fn fh_abi(input: proc_macro::TokenStream) -> proc_macro::TokenStream {
    let input: DeriveInput = parse_macro_input!(input);
    let gen = literal_abi(input);
    gen.into()
}

fn literal_abi(input: DeriveInput) -> proc_macro2::TokenStream {
    let ident = input.ident;

    let typescript_type = format!("bindings.{}", &ident);
    let typescript_type_len = typescript_type.len() as u32;
    let typescript_type_chars = typescript_type.chars().map(|c| c as u32);

    let describe = quote! {
        impl WasmDescribe for #ident {
            fn describe() {
                use wasm_bindgen::describe::*;
                inform(NAMED_EXTERNREF);
                inform(#typescript_type_len);
                #(inform(#typescript_type_chars);)*
            }
        }
    };

    quote! {
        #[allow(bad_style)]
        #[allow(clippy::all)]
        const _: () = {
            use wasm_bindgen::{
                convert::{FromWasmAbi, IntoWasmAbi, OptionIntoWasmAbi},
                describe::WasmDescribe,
                prelude::*,
            };

            #describe

            impl IntoWasmAbi for #ident {
                type Abi = <JsValue as IntoWasmAbi>::Abi;
                #[inline]
                fn into_abi(self) -> Self::Abi {
                    JsValue::from_serde(&self).unwrap_throw().into_abi()
                }
            }

            impl OptionIntoWasmAbi for #ident {
                #[inline]
                fn none() -> Self::Abi {
                    0
                }
            }

            impl FromWasmAbi for #ident {
                type Abi = <JsValue as FromWasmAbi>::Abi;
                #[inline]
                unsafe fn from_abi(js: Self::Abi) -> Self {
                    JsValue::from_abi(js).into_serde().unwrap_throw()
                }
            }
        };
    }
}
