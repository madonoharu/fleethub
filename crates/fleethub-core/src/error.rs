use strum::Display;
use thiserror::Error;

pub const SHIP_NOT_FOUND: &str = "Ship not found";

#[derive(Debug, Display, Error)]
pub enum CalculationError {
    UnknownValue,
}

#[derive(Debug, Error, PartialEq, Eq)]
#[error("TryFromOrgTypeError")]
pub struct TryFromOrgTypeError;
