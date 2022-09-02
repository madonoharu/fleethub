use serde::Serialize;
use tsify::Tsify;

#[derive(Debug, Tsify)]
#[serde(transparent)]
pub struct FhResult<T> {
    #[tsify(type = "{ Ok: T } | { Err: string }")]
    inner: anyhow::Result<T>,
}

impl<T> Serialize for FhResult<T>
where
    T: Serialize,
{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        self.inner
            .as_ref()
            .map_err(|err| err.to_string())
            .serialize(serializer)
    }
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
