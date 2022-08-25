mod compiled_evaler;
mod master_equippable;
mod master_gear;
mod master_ibonus;
mod master_ship;

use enumset::EnumSet;
use serde::{de::DeserializeOwned, Deserialize};
use serde_with::{serde_as, DefaultOnError};
use tsify::Tsify;

use master_equippable::*;
pub use master_gear::*;
pub use master_ibonus::*;
pub use master_ship::*;

use crate::{
    gear::IBonuses,
    ship::ShipEquippable,
    types::{
        AntiAirCutinDef, BattleDefinitions, DayCutinDef, GearAttr, NestedFormationDef,
        NightCutinDef, ShipAttr,
    },
};

use compiled_evaler::CompiledEvaler;

#[serde_as]
#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterAttrRule<T: Default + DeserializeOwned> {
    #[serde_as(as = "DefaultOnError")]
    pub tag: T,
    pub name: String,
    #[tsify(type = "string")]
    pub expr: CompiledEvaler,
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterConfig {
    pub formation: Vec<NestedFormationDef>,
    pub anti_air_cutin: Vec<AntiAirCutinDef>,
    pub day_cutin: Vec<DayCutinDef>,
    pub night_cutin: Vec<NightCutinDef>,
}

#[serde_as]
#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterData {
    pub gears: Vec<MasterGear>,
    pub gear_attrs: Vec<MasterAttrRule<GearAttr>>,
    #[serde_as(as = "DefaultOnError")]
    pub ships: Vec<MasterShip>,
    pub ship_attrs: Vec<MasterAttrRule<ShipAttr>>,
    pub ibonuses: MasterIBonuses,
    pub equippable: MasterEquippable,
    pub formation: Vec<NestedFormationDef>,
    pub anti_air_cutin: Vec<AntiAirCutinDef>,
    pub day_cutin: Vec<DayCutinDef>,
    pub night_cutin: Vec<NightCutinDef>,
}

impl MasterData {
    pub fn init(mut self) -> Self {
        let Self {
            ships,
            ship_attrs,
            gears,
            gear_attrs,
            ..
        } = &mut self;

        ships.iter_mut().for_each(|ship| {
            ship.attrs = ship_attrs
                .iter()
                .filter_map(|rule| {
                    if rule.expr.eval(&mut ship.ns()).ok()? == 1.0 {
                        Some(rule.tag)
                    } else {
                        None
                    }
                })
                .collect::<EnumSet<_>>();
        });

        gears.iter_mut().for_each(|gear| {
            gear.attrs = gear_attrs
                .iter()
                .filter_map(|rule| {
                    if rule.expr.eval(&mut gear.ns()).ok()? == 1.0 {
                        Some(rule.tag)
                    } else {
                        None
                    }
                })
                .collect::<EnumSet<_>>();
        });

        self
    }

    pub fn get_ibonuses(&self, gear: &MasterGear, stars: u8) -> IBonuses {
        self.ibonuses.eval(gear, stars)
    }

    pub fn create_ship_equippable(&self, ship: &MasterShip) -> ShipEquippable {
        self.equippable.create_ship_equippable(ship)
    }

    pub fn battle_definitions(&self) -> BattleDefinitions {
        let formation = self
            .formation
            .iter()
            .map(|def| (def.tag(), def.clone()))
            .collect();

        let anti_air_cutin = self
            .anti_air_cutin
            .iter()
            .map(|def| (def.id, def.clone()))
            .collect();

        let day_cutin = self
            .day_cutin
            .iter()
            .map(|def| (def.tag, def.clone()))
            .collect();

        let night_cutin = self
            .night_cutin
            .iter()
            .map(|def| (def.tag, def.clone()))
            .collect();

        BattleDefinitions {
            formation,
            anti_air_cutin,
            day_cutin,
            night_cutin,
        }
    }
}
