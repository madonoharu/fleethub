use serde::Serialize;
use serde_with::{DisplayFromStr, serde_as};
use tsify::Tsify;

#[serde_as]
#[allow(dead_code)]
#[derive(Debug, Serialize, Tsify)]
#[serde(transparent, bound(serialize = "T: Serialize"))]
pub struct FhResult<T> {
    #[serde_as(serialize_as = "Result<_, DisplayFromStr>")]
    #[tsify(type = "{ Ok: T } | { Err: string }")]
    inner: anyhow::Result<T>,
}

impl<T, R> From<R> for FhResult<T>
where
    R: Into<anyhow::Result<T>>,
{
    #[inline]
    fn from(result: R) -> Self {
        Self {
            inner: result.into(),
        }
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::FhResult;

    #[test]
    fn serializes_success_with_the_public_result_tag() {
        let result = FhResult::from(Ok::<_, anyhow::Error>(vec![Some("艦娘"), None]));

        assert_eq!(
            serde_json::to_value(result).unwrap(),
            json!({ "Ok": ["艦娘", null] })
        );
    }

    #[test]
    fn serializes_only_the_displayed_error_context() {
        let message = "装備 \"未設定\"\n再確認";
        let error = anyhow::anyhow!("underlying error").context(message);
        let result = FhResult::<()>::from(Err::<(), _>(error));

        assert_eq!(
            serde_json::to_string(&result).unwrap(),
            serde_json::to_string(&json!({ "Err": message })).unwrap()
        );
    }
}
