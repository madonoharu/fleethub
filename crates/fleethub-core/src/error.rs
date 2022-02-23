use strum::Display;
use thiserror::Error;

#[derive(Debug, Display, Error)]
pub enum CalculationError {
    UnknownValue,
}
