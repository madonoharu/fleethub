use thiserror::Error;

pub const SHIP_NOT_FOUND: &str = "Ship not found";

#[derive(Debug, Error)]
pub enum CalculationError {
    #[error("UnknownValue")]
    UnknownValue,
}

#[derive(Debug, Error, PartialEq, Eq)]
#[error("TryFromOrgTypeError")]
pub struct TryFromOrgTypeError;
