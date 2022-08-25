use itertools::Itertools;

fn exactly_n_of(vec: &[f64], n: usize) -> f64 {
    vec.iter()
        .combinations(n)
        .map(|c| {
            let a = vec
                .iter()
                .filter(|a| !c.iter().any(|b| a == b))
                .map(|v| 1.0 - v)
                .product::<f64>();

            a * c.into_iter().product::<f64>()
        })
        .sum::<f64>()
}

#[allow(dead_code)]
fn at_least_n_of(vec: &Vec<f64>, n: usize) -> f64 {
    (n..=vec.len()).map(|n| exactly_n_of(vec, n)).sum()
}

#[cfg(test)]
mod test {
    use super::*;

    macro_rules! assert_float_eq {
        ($left:expr, $right:expr $(,)?) => {
            assert!(($left - $right).abs() < 1e-10);
        };
    }

    #[test]
    fn aa() {
        let vec = vec![0.1, 0.2, 0.3];

        assert_float_eq!(at_least_n_of(&vec, 0), 1.0);

        assert_float_eq!(
            at_least_n_of(&vec, 1),
            (1.0 - (1.0 - 0.1) * (1.0 - 0.2) * (1.0 - 0.3))
        );

        assert_float_eq!(
            at_least_n_of(&vec, 2),
            ((1.0 - 0.1) * 0.2 * 0.3
                + 0.1 * (1.0 - 0.2) * 0.3
                + 0.1 * 0.2 * (1.0 - 0.3)
                + 0.1 * 0.2 * 0.3)
        );

        assert_float_eq!(at_least_n_of(&vec, 3), 0.1 * 0.2 * 0.3);
        assert_float_eq!(at_least_n_of(&vec, 4), 0.0);
        assert_float_eq!(at_least_n_of(&vec, 5), 0.0);
    }
}
