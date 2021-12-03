use std::ops::Not;

use quote::quote;
use syn::{parse_macro_input, Attribute, DeriveInput, Meta, NestedMeta};

#[proc_macro_derive(FhAbi, attributes(fh_abi))]
pub fn fh_abi(input: proc_macro::TokenStream) -> proc_macro::TokenStream {
    let input: DeriveInput = parse_macro_input!(input);
    let gen = impl_abi(input);
    gen.into()
}

fn get_meta_items(attr: &Attribute) -> Result<Vec<NestedMeta>, ()> {
    if !attr.path.is_ident("fh_abi") {
        return Ok(Vec::new());
    }

    let meta = attr.parse_meta();

    if let Ok(Meta::List(list)) = meta {
        Ok(list.nested.into_iter().collect())
    } else {
        Err(())
    }
}

#[derive(Debug, Default)]
struct Ctx {
    skip_into_abi: bool,
    skip_from_abi: bool,
}

impl Ctx {
    fn new() -> Self {
        Self::default()
    }
}

fn impl_abi(input: DeriveInput) -> proc_macro2::TokenStream {
    let mut ctx = Ctx::new();

    input
        .attrs
        .iter()
        .flat_map(get_meta_items)
        .flatten()
        .for_each(|m| {
            if let NestedMeta::Meta(Meta::Path(path)) = m {
                if path.is_ident("skip_into_abi") {
                    ctx.skip_into_abi = true;
                }

                if path.is_ident("skip_from_abi") {
                    ctx.skip_from_abi = true;
                }
            }
        });

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

    let into_abi = ctx.skip_into_abi.not().then(|| {
        quote! {
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
        }
    });

    let from_abi = ctx.skip_from_abi.not().then(|| {
        quote! {
            impl FromWasmAbi for #ident {
                type Abi = <JsValue as FromWasmAbi>::Abi;
                #[inline]
                unsafe fn from_abi(js: Self::Abi) -> Self {
                    JsValue::from_abi(js).into_serde().unwrap_throw()
                }
            }

            impl OptionFromWasmAbi for #ident {
                #[inline]
                fn is_none(abi: &Self::Abi) -> bool { *abi == 0 }
            }
        }
    });

    quote! {
        #[allow(bad_style)]
        #[allow(clippy::all)]
        const _: () = {
            use wasm_bindgen::{
                convert::{FromWasmAbi, IntoWasmAbi, OptionIntoWasmAbi, OptionFromWasmAbi},
                describe::WasmDescribe,
                prelude::*,
            };

            #describe
            #into_abi
            #from_abi
        };
    }
}
