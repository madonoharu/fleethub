use crate::error::TryFromOrgTypeError;

use super::{OrgType, Side};

#[derive(Debug, Clone, Copy)]
pub enum PlayerCompType {
    Single,
    CarrierTaskForce,
    SurfaceTaskForce,
    TransportEscortForce,
}

impl From<PlayerCompType> for OrgType {
    fn from(value: PlayerCompType) -> Self {
        match value {
            PlayerCompType::Single => Self::Single,
            PlayerCompType::CarrierTaskForce => Self::CarrierTaskForce,
            PlayerCompType::SurfaceTaskForce => Self::SurfaceTaskForce,
            PlayerCompType::TransportEscortForce => Self::TransportEscort,
        }
    }
}

impl TryFrom<OrgType> for PlayerCompType {
    type Error = TryFromOrgTypeError;

    fn try_from(value: OrgType) -> Result<Self, Self::Error> {
        let t = match value {
            OrgType::Single => Self::Single,
            OrgType::CarrierTaskForce => Self::CarrierTaskForce,
            OrgType::TransportEscort => Self::TransportEscortForce,
            OrgType::SurfaceTaskForce => Self::SurfaceTaskForce,
            OrgType::EnemySingle | OrgType::EnemyCombined => return Err(TryFromOrgTypeError),
        };

        Ok(t)
    }
}

#[derive(Debug, Clone, Copy)]
pub enum EnemyCompType {
    Single,
    Combined,
}

impl From<EnemyCompType> for OrgType {
    fn from(value: EnemyCompType) -> Self {
        match value {
            EnemyCompType::Single => Self::EnemySingle,
            EnemyCompType::Combined => Self::EnemyCombined,
        }
    }
}

impl TryFrom<OrgType> for EnemyCompType {
    type Error = TryFromOrgTypeError;

    fn try_from(value: OrgType) -> Result<Self, Self::Error> {
        let t = match value {
            OrgType::Single
            | OrgType::CarrierTaskForce
            | OrgType::TransportEscort
            | OrgType::SurfaceTaskForce => return Err(TryFromOrgTypeError),
            OrgType::EnemySingle => Self::Single,
            OrgType::EnemyCombined => Self::Combined,
        };

        Ok(t)
    }
}
pub trait CompTypeTrait: Copy + Into<OrgType> {
    fn side(&self) -> Side;
}

impl CompTypeTrait for PlayerCompType {
    fn side(&self) -> Side {
        Side::Player
    }
}

impl CompTypeTrait for EnemyCompType {
    fn side(&self) -> Side {
        Side::Enemy
    }
}

#[cfg(test)]
mod test {
    use crate::types::OrgType;

    use super::*;

    #[test]
    fn test_comp_type() {
        assert_eq!(OrgType::from(PlayerCompType::Single), OrgType::Single);
        assert_eq!(OrgType::from(EnemyCompType::Single), OrgType::EnemySingle);
        assert_eq!(
            OrgType::from(EnemyCompType::Combined),
            OrgType::EnemyCombined
        );
    }
}
