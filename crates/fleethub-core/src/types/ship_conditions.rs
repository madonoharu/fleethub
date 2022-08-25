use serde::{Deserialize, Serialize};
use tsify::Tsify;

use super::{FleetPosition, Formation, OrgType, ShipEnvironment, ShipPosition, Side};

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(default)]
struct ShipConditionsDef {
    #[serde(flatten)]
    pub position: ShipPosition,
    pub formation: Option<Formation>,
}

impl From<ShipConditionsDef> for ShipConditions {
    fn from(def: ShipConditionsDef) -> Self {
        let org_type = def.position.org_type;
        let mut formation = def
            .formation
            .unwrap_or_else(|| org_type.default_formation());

        if org_type.is_combined() != formation.is_combined() {
            formation = org_type.default_formation();
        }

        Self {
            position: def.position,
            formation,
        }
    }
}

#[derive(Debug, Clone, Copy, Default, Serialize, Deserialize, Tsify)]
#[serde(default, from = "ShipConditionsDef")]
#[tsify(from_wasm_abi, into_wasm_abi)]
pub struct ShipConditions {
    #[serde(flatten)]
    pub position: ShipPosition,
    pub formation: Formation,
}

impl ShipConditions {
    pub fn side(&self) -> Side {
        self.position.side()
    }

    pub fn is_flagship(&self) -> bool {
        self.position.is_flagship()
    }

    pub fn is_main_flagship(&self) -> bool {
        self.position.is_main_flagship()
    }

    pub fn fleet_position(&self) -> FleetPosition {
        self.position.into()
    }

    pub fn with_side(side: Side) -> Self {
        let org_type = if side.is_player() {
            OrgType::Single
        } else {
            OrgType::EnemySingle
        };

        Self {
            position: ShipPosition {
                org_type,
                ..Default::default()
            },
            formation: Formation::LINE_AHEAD,
        }
    }
}

impl From<&ShipEnvironment> for ShipConditions {
    fn from(env: &ShipEnvironment) -> Self {
        Self {
            position: ShipPosition {
                org_type: env.org_type,
                role: env.role,
                fleet_len: env.fleet_len,
                index: env.index,
            },
            formation: env.formation,
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    macro_rules! ship_conditions {
        ($($json:tt)+) => {{
            let value = serde_json::json!($($json)+);
            let deserialized: ShipConditions = serde_json::from_value(value).unwrap();
            deserialized
        }};
    }

    #[test]
    fn test_deserialized_ship_conditions() {
        assert_eq!(ship_conditions!({}).formation, Formation::LINE_AHEAD);

        assert_eq!(
            ship_conditions!({
                "org_type": "Single"
            })
            .formation,
            Formation::LINE_AHEAD
        );

        assert_eq!(
            ship_conditions!({
                "org_type": "CarrierTaskForce"
            })
            .formation,
            Formation::CRUISING4
        );

        assert_eq!(
            ship_conditions!({
                "org_type": "EnemySingle"
            })
            .formation,
            Formation::LINE_AHEAD
        );

        assert_eq!(
            ship_conditions!({
                "org_type": "EnemyCombined"
            })
            .formation,
            Formation::CRUISING4
        );

        assert_eq!(
            ship_conditions!({
                "org_type": "Single",
                "formation": "DoubleLine",
            })
            .formation,
            Formation::DOUBLE_LINE
        );

        assert_eq!(
            ship_conditions!({
                "org_type": "Single",
                "formation": "Cruising4",
            })
            .formation,
            Formation::LINE_AHEAD
        );

        assert_eq!(
            ship_conditions!({
                "org_type": "SurfaceTaskForce",
                "formation": "Cruising2",
            })
            .formation,
            Formation::CRUISING2
        );

        assert_eq!(
            ship_conditions!({
                "org_type": "SurfaceTaskForce",
                "formation": "LineAhead",
            })
            .formation,
            Formation::CRUISING4
        );

        assert_eq!(
            ship_conditions!({
                "org_type": "EnemySingle",
                "formation": "Cruising4",
            })
            .formation,
            Formation::LINE_AHEAD
        );
    }
}
