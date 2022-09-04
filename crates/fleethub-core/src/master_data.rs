mod compiled_evaler;
mod master_battle_definitions;
mod master_equippability;
mod master_gear;
mod master_ibonus;
mod master_ship;

use serde::{de::DeserializeOwned, Deserialize};
use serde_with::{serde_as, DefaultOnError};
use tsify::Tsify;

pub use master_battle_definitions::*;
pub use master_equippability::*;
pub use master_gear::*;
pub use master_ibonus::*;
pub use master_ship::*;

use crate::types::{BattleDefinitions, GearAttr, ShipAttr};

use compiled_evaler::CompiledEvaler;

#[serde_as]
#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterAttrRule<T: Default + DeserializeOwned> {
    #[serde_as(as = "DefaultOnError")]
    pub tag: T,
    pub name: String,
    pub expr: CompiledEvaler,
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct NationalityDef {
    pub id: u8,
    pub ctypes: Vec<u8>,
}

#[serde_as]
#[derive(Debug, Deserialize)]
struct MasterDataShadow {
    created_at: f64,
    gears: Vec<MasterGear>,
    gear_attrs: Vec<MasterAttrRule<GearAttr>>,
    #[serde_as(as = "DefaultOnError")]
    ships: Vec<MasterShip>,
    ship_attrs: Vec<MasterAttrRule<ShipAttr>>,
    ibonuses: MasterIBonuses,
    equippable: MasterEquippability,
    #[serde(flatten)]
    battle_definitions: MasterBattleDefinitions,
}

#[serde_as]
#[derive(Debug, Default, Clone, Deserialize, Tsify)]
#[serde(from = "MasterDataShadow")]
pub struct MasterData {
    pub created_at: f64,
    pub gears: Vec<MasterGear>,
    pub gear_attrs: Vec<MasterAttrRule<GearAttr>>,
    pub ships: Vec<MasterShip>,
    pub ship_attrs: Vec<MasterAttrRule<ShipAttr>>,
    pub ibonuses: MasterIBonuses,
    pub equippable: MasterEquippability,
    #[serde(flatten)]
    pub battle_definitions: MasterBattleDefinitions,
}

impl From<MasterDataShadow> for MasterData {
    fn from(def: MasterDataShadow) -> Self {
        let MasterDataShadow {
            created_at,
            mut gears,
            gear_attrs,
            mut ships,
            ship_attrs,
            ibonuses,
            equippable,
            battle_definitions,
        } = def;

        ships.iter_mut().for_each(|ship| {
            ship_attrs.iter().for_each(|rule| {
                if rule.expr.matches(&mut ship.ns()) {
                    ship.attrs.insert(rule.tag);
                }
            });
        });

        gears.iter_mut().for_each(|gear| {
            gear_attrs.iter().for_each(|rule| {
                if rule.expr.matches(&mut gear.ns()) {
                    gear.attrs.insert(rule.tag);
                }
            });
        });

        Self {
            created_at,
            gears,
            gear_attrs,
            ships,
            ship_attrs,
            ibonuses,
            equippable,
            battle_definitions,
        }
    }
}

impl MasterData {
    pub fn get_ibonuses(&self, gear: &MasterGear, stars: u8) -> IBonuses {
        self.ibonuses.eval(gear, stars)
    }

    pub fn create_ship_equippability(&self, ship: &MasterShip) -> ShipEquippability {
        self.equippable.create_ship_equippability(ship)
    }

    pub fn battle_definitions(&self) -> BattleDefinitions {
        self.battle_definitions.battle_definitions()
    }
}
