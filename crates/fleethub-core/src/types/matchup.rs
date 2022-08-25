#![allow(dead_code, clippy::all)]

use thiserror::Error;

use crate::error::TryFromOrgTypeError;

use super::{OrgType, Role};

#[derive(Debug, Error, PartialEq)]
#[error("invalid matchup: {player:?} vs {enemy:?}")]
pub struct InvalidMatchup {
    player: OrgType,
    enemy: OrgType,
}

trait FleetType:
    TryInto<PlayerFleetType, Error = TryFromOrgTypeError>
    + TryInto<EnemyFleetType, Error = TryFromOrgTypeError>
{
}

impl<T> FleetType for T where
    T: TryInto<PlayerFleetType, Error = TryFromOrgTypeError>
        + TryInto<EnemyFleetType, Error = TryFromOrgTypeError>
{
}

pub struct Matchup {
    player: PlayerFleetType,
    enemy: EnemyFleetType,
}

// impl<T> TryFrom<(T, T)> for Matchup
// where
//     T: TryInto<PlayerFleetType, Error = TryFromOrgTypeError>
//         + TryInto<EnemyFleetType, Error = TryFromOrgTypeError>,
// {
//     type Error = InvalidMatchup;

//     fn try_from(value: (T, T)) -> Result<Self, Self::Error> {
//         Ok(Self {
//             player: value.0.try_into()?,
//             enemy: value.1.try_into()?,
//         })
//     }
// }

#[derive(Debug, Clone, Copy, Default)]
pub enum PlayerFleetType {
    #[default]
    Single,
    CTF(Role),
    STF(Role),
    TCF(Role),
}

#[derive(Debug, Clone, Copy, Default)]
pub enum EnemyFleetType {
    #[default]
    Single,
    Combined(Role),
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_matchup() {
        let a = InvalidMatchup {
            player: OrgType::Single,
            enemy: OrgType::Single,
        };

        println!("{}", a);
    }
}
