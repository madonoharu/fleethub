use serde::Deserialize;
use tsify::Tsify;

use super::MasterShip;
use crate::ship::ShipEquippable;

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
    pub api_slotitem_id: u16,
    pub api_ship_ids: Vec<u16>,
}

#[derive(Debug, Default, Clone, Deserialize, Tsify)]
pub struct MasterEquippable {
    pub equip_stype: Vec<EquipStype>,
    pub equip_exslot: Vec<u8>,
    pub equip_ship: Vec<MstEquipShip>,
    pub equip_exslot_ship: Vec<MstEquipExslotShip>,
}

impl MasterEquippable {
    pub fn create_ship_equippable(&self, ship: &MasterShip) -> ShipEquippable {
        let equip_ship = self
            .equip_ship
            .iter()
            .find(|es| es.api_ship_id == ship.ship_id)
            .map(|es| &es.api_equip_type);

        let types = equip_ship
            .or(self
                .equip_stype
                .iter()
                .find(|es| es.id == ship.stype)
                .map(|es| &es.equip_type))
            .map(|v| v.clone())
            .unwrap_or_default();

        let exslot_gear_ids = self
            .equip_exslot_ship
            .iter()
            .filter(|ees| ees.api_ship_ids.contains(&ship.ship_id))
            .map(|ees| ees.api_slotitem_id)
            .collect();

        ShipEquippable {
            types,
            exslot_gear_ids,
            exslot_types: self.equip_exslot.clone(),
        }
    }
}
