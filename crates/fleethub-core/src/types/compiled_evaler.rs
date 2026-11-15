use fasteval::{Compiler, EvalNamespace, Evaler, Instruction, Parser, Slab};
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
    slab_capacity: usize,
    instruction: Instruction,
}

/// fasteval の Slab は容量を超えると伸長せずに `SlabOverflow` を返す。
/// `ship_id_in` のように引数の多い式は既定の容量 64 では足りないので、64 から順に倍にして再試行する。
const INITIAL_SLAB_CAPACITY: usize = 64;
const MAX_SLAB_CAPACITY: usize = 1024;

fn parse(expr: &str, capacity: usize) -> Result<(Slab, Instruction), fasteval::Error> {
    let parser = Parser::new();
    let mut slab = Slab::with_capacity(capacity);

    let instruction = parser
        .parse(expr, &mut slab.ps)?
        .from(&slab.ps)
        .compile(&slab.ps, &mut slab.cs);

    Ok((slab, instruction))
}

impl CompiledEvaler {
    pub fn new(expr: String) -> Result<Self, fasteval::Error> {
        Self::with_slab_capacity(expr, INITIAL_SLAB_CAPACITY)
    }

    fn with_slab_capacity(expr: String, mut capacity: usize) -> Result<Self, fasteval::Error> {
        if expr.is_empty() {
            return Ok(Self {
                expr,
                slab: Slab::with_capacity(0),
                slab_capacity: 0,
                instruction: Instruction::IConst(0.0),
            });
        }

        loop {
            match parse(expr.as_str(), capacity) {
                Ok((slab, instruction)) => {
                    return Ok(Self {
                        expr,
                        slab,
                        slab_capacity: capacity,
                        instruction,
                    });
                }
                Err(fasteval::Error::SlabOverflow) if capacity < MAX_SLAB_CAPACITY => {
                    capacity *= 2;
                }
                Err(err) => return Err(err),
            }
        }
    }

    pub fn eval<T: EvalNamespace>(&self, ns: &mut T) -> Result<f64, fasteval::Error> {
        self.instruction.eval(&self.slab, ns)
    }

    pub fn matches<T: EvalNamespace>(&self, ns: &mut T) -> bool {
        self.eval(ns).unwrap_or_default() == 1.0
    }

    pub fn is_empty(&self) -> bool {
        self.expr.is_empty()
    }
}

impl Clone for CompiledEvaler {
    fn clone(&self) -> Self {
        Self::with_slab_capacity(self.expr.clone(), self.slab_capacity).unwrap()
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

        let empty_evaler: CompiledEvaler = serde_json::from_str("\"\"").unwrap();
        assert_eq!(empty_evaler.eval(&mut ns).unwrap(), 0.0);
    }

    #[test]
    fn test_expr_with_more_args_than_default_slab_capacity() {
        let args = (1..=100).map(|i| i.to_string()).collect::<Vec<_>>();
        let expr = format!("f({})", args.join(", "));

        let evaler = CompiledEvaler::new(expr).unwrap();
        let mut ns = |name: &str, args: Vec<f64>| -> Option<f64> {
            (name == "f").then(|| args.into_iter().sum())
        };

        assert_eq!(evaler.eval(&mut ns).unwrap(), 5050.0);

        let cloned = evaler.clone();
        assert_eq!(cloned.slab_capacity, evaler.slab_capacity);
        assert_eq!(cloned.eval(&mut ns).unwrap(), 5050.0);
    }
}
