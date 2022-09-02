use fasteval::{eval_compiled_ref, Compiler, EvalNamespace, Evaler, Instruction, Parser, Slab};
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"
export type CompiledEvaler = string;
"#;

#[derive(Debug, Default, Deserialize)]
#[serde(try_from = "String")]
pub struct CompiledEvaler {
    expr: String,
    slab: Slab,
    instruction: Instruction,
}

impl CompiledEvaler {
    pub fn new(expr: String) -> Result<Self, fasteval::Error> {
        let parser = Parser::new();
        let mut slab = Slab::new();

        let instruction = parser
            .parse(expr.as_str(), &mut slab.ps)?
            .from(&slab.ps)
            .compile(&slab.ps, &mut slab.cs);

        Ok(Self {
            expr,
            slab,
            instruction,
        })
    }

    pub fn eval<T: EvalNamespace>(&self, ns: &mut T) -> Result<f64, fasteval::Error> {
        Ok(eval_compiled_ref!(&self.instruction, &self.slab, ns))
    }

    pub fn matches<T: EvalNamespace>(&self, ns: &mut T) -> bool {
        self.eval(ns).unwrap_or_default() == 1.0
    }
}

impl Clone for CompiledEvaler {
    fn clone(&self) -> Self {
        Self::new(self.expr.clone()).unwrap()
    }
}

impl TryFrom<String> for CompiledEvaler {
    type Error = fasteval::Error;

    fn try_from(expr: String) -> Result<Self, Self::Error> {
        Self::new(expr)
    }
}

#[cfg(test)]
mod test {
    use std::collections::BTreeMap;

    use super::CompiledEvaler;

    #[test]
    fn test() {
        let value = serde_json::json!("x + 1");
        let evaler: CompiledEvaler = serde_json::from_value(value).unwrap();
        let mut ns = BTreeMap::new();

        assert_eq!(
            evaler.eval(&mut ns),
            Err(fasteval::Error::Undefined("x".to_string()))
        );

        ns.insert("x", 1.0);
        assert_eq!(evaler.eval(&mut ns).unwrap(), 2.0);

        ns.insert("x", 2.0);
        assert_eq!(evaler.eval(&mut ns).unwrap(), 3.0);
    }
}
