use hashbrown::HashMap;
use serde::Deserialize;
use tsify::Tsify;

use crate::{
    gear::Gear,
    gear_array::gear_key_to_index,
    types::{gear_id, CompiledEvaler},
};

use super::MasterShip;

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct EquipStype {
    pub id: u8,
    pub equip_type: Vec<u8>,
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MstEquipShip {
    pub api_ship_id: u16,
    pub api_equip_type: Vec<u8>,
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MstEquipExslotShip {
    pub api_ctypes: Option<HashMap<u16, u8>>,
    pub api_ship_ids: Option<HashMap<u16, u8>>,
    pub api_stypes: Option<HashMap<u8, u8>>,
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterEquippability {
    pub equip_stype: Vec<EquipStype>,
    pub equip_exslot: Vec<u8>,
    pub equip_ship: Vec<MstEquipShip>,
    pub equip_exslot_ship: HashMap<u16, MstEquipExslotShip>,
    pub rules: Vec<EquippabilityRule>,
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct EquippabilityRule {
    pub ship: CompiledEvaler,
    #[serde(default)]
    pub keys: Vec<String>,
    #[serde(default)]
    pub include: String,
    #[serde(default)]
    pub exclude: String,
}

impl MasterEquippability {
    pub fn create_ship_equippability(&self, ship: &MasterShip) -> ShipEquippability {
        if ship.is_abyssal() {
            return ShipEquippability::abyssal();
        }

        let equip_ship = self
            .equip_ship
            .iter()
            .find(|es| es.api_ship_id == ship.ship_id)
            .map(|es| &es.api_equip_type);

        let types = equip_ship
            .or_else(|| {
                self.equip_stype
                    .iter()
                    .find(|es| es.id == ship.stype)
                    .map(|es| &es.equip_type)
            })
            .cloned()
            .unwrap_or_default();

        let exslot_gear_ids = self
            .equip_exslot_ship
            .iter()
            .filter(|(_, ees)| {
                ees.api_ctypes
                    .as_ref()
                    .is_some_and(|m| m.contains_key(&ship.ctype))
                    || ees
                        .api_stypes
                        .as_ref()
                        .is_some_and(|m| m.contains_key(&ship.stype))
                    || ees
                        .api_ship_ids
                        .as_ref()
                        .is_some_and(|m| m.contains_key(&ship.ship_id))
            })
            .map(|(id, _)| *id)
            .collect();

        let mut ns = ship.ns();

        let mut includes = vec![];
        let mut excludes = vec![];

        self.rules
            .iter()
            .filter(|rule| rule.ship.matches(&mut ns))
            .try_for_each(|rule| {
                if !rule.include.is_empty() {
                    includes.push(EquippabilityPattern {
                        keys: rule.keys.clone(),
                        gear: CompiledEvaler::new(rule.include.clone()).ok()?,
                    })
                }
                if !rule.exclude.is_empty() {
                    excludes.push(EquippabilityPattern {
                        keys: rule.keys.clone(),
                        gear: CompiledEvaler::new(rule.exclude.clone()).ok()?,
                    })
                }

                Some(())
            });

        ShipEquippability {
            types,
            exslot_gear_ids,
            exslot_types: self.equip_exslot.clone(),
            slotnum: ship.slotnum,
            abyssal: false,
            includes,
            excludes,
        }
    }
}

#[derive(Debug, Default, Clone)]
pub struct EquippabilityPattern {
    pub keys: Vec<String>,
    pub gear: CompiledEvaler,
}

impl EquippabilityPattern {
    pub fn matches(&self, key: &str, gear: &Gear) -> bool {
        (self.keys.is_empty() || self.keys.iter().any(|k| k == key))
            && (self.gear.eval(&mut gear.ns()).ok().unwrap_or_default() == 1.0)
    }
}

#[derive(Debug, Default, Clone)]
pub struct ShipEquippability {
    pub types: Vec<u8>,
    pub exslot_types: Vec<u8>,
    pub exslot_gear_ids: Vec<u16>,
    pub slotnum: usize,
    pub abyssal: bool,
    pub excludes: Vec<EquippabilityPattern>,
    pub includes: Vec<EquippabilityPattern>,
}

impl ShipEquippability {
    pub fn abyssal() -> Self {
        Self {
            abyssal: true,
            ..Default::default()
        }
    }

    pub fn can_equip(&self, key: &str, gear: &Gear) -> bool {
        if self.abyssal {
            return true;
        }

        if self.includes.iter().any(|rule| rule.matches(key, gear)) {
            return true;
        }

        if !self.types.contains(&gear.special_type) {
            return false;
        }

        if self.excludes.iter().any(|rule| rule.matches(key, gear)) {
            return false;
        }

        if key == "gx" {
            self.exslot_types.contains(&gear.special_type)
                || self.exslot_gear_ids.contains(&gear.gear_id)
                || gear.gear_id == gear_id!("改良型艦本式タービン")
        } else if let Some(index) = gear_key_to_index(key) {
            index < self.slotnum
        } else {
            false
        }
    }
}
