use crate::{
    air_squadron::AirSquadron,
    fleet::{Fleet, ShipArray},
    gear::Gear,
    gear_array::GearArray,
    org::Org,
    ship::Ship,
    types::{
        AirSquadronState, EBonusFn, EBonuses, FleetState, GearAttr, GearState, GearType,
        MasterData, OrgState, OrgType, ShipAttr, ShipState, SlotSizeArray,
    },
    utils::xxh3,
};

pub struct Factory {
    pub master_data: MasterData,
    pub ebonus_fn: EBonusFn,
}

impl Factory {
    pub fn create_gear(&self, input: Option<GearState>) -> Option<Gear> {
        let state = input?;

        let master = self
            .master_data
            .gears
            .iter()
            .find(|mg| mg.gear_id == state.gear_id)?;

        let ibonuses = self
            .master_data
            .get_ibonuses(master, state.stars.unwrap_or_default());

        Some(Gear::new(state, master, ibonuses))
    }

    pub fn create_ship(&self, input: Option<ShipState>) -> Option<Ship> {
        let state = input?;

        let ShipState {
            g1,
            g2,
            g3,
            g4,
            g5,
            gx,
            ..
        } = &state;

        let create_gear = |g: &Option<GearState>| self.create_gear(g.clone());

        let gears = GearArray::new([
            create_gear(g1),
            create_gear(g2),
            create_gear(g3),
            create_gear(g4),
            create_gear(g5),
            create_gear(gx),
        ]);

        let master_ship = self
            .master_data
            .ships
            .iter()
            .find(|ship| ship.ship_id == state.ship_id)?;

        let equippable = self.master_data.create_ship_equippable(&master_ship);

        let ebonuses: EBonuses = self.ebonus_fn.call(&master_ship, &gears);

        let ship = Ship::new(state, master_ship, equippable, gears, ebonuses);

        Some(ship)
    }

    pub fn create_fleet(&self, input: Option<FleetState>) -> Fleet {
        let state = input.unwrap_or_default();
        let xxh3 = xxh3(&state);

        let FleetState {
            id,
            s1,
            s2,
            s3,
            s4,
            s5,
            s6,
            s7,
        } = state;

        let ships = ShipArray::new([
            self.create_ship(s1),
            self.create_ship(s2),
            self.create_ship(s3),
            self.create_ship(s4),
            self.create_ship(s5),
            self.create_ship(s6),
            self.create_ship(s7),
        ]);

        Fleet {
            id: id.unwrap_or_default(),
            xxh3,
            ships,
        }
    }

    pub fn create_air_squadron(&self, input: Option<AirSquadronState>) -> AirSquadron {
        let state = input.unwrap_or_default();
        let xxh3 = xxh3(&state);

        let AirSquadronState {
            id,
            mode,
            g1,
            g2,
            g3,
            g4,
            ss1,
            ss2,
            ss3,
            ss4,
            ..
        } = state;

        let create_gear = |g: Option<GearState>| self.create_gear(g);

        let gears = GearArray::new([
            create_gear(g1),
            create_gear(g2),
            create_gear(g3),
            create_gear(g4),
            None,
            None,
        ]);

        let max_slots: SlotSizeArray = (0..4)
            .map(|index| {
                if let Some(gear) = gears.get(index) {
                    if gear.gear_type == GearType::LargeLbAircraft {
                        9
                    } else if gear.has_attr(GearAttr::Recon) {
                        4
                    } else {
                        18
                    }
                } else {
                    18
                }
            })
            .map(Some)
            .collect();

        let slots = std::array::IntoIter::new([ss1, ss2, ss3, ss4])
            .enumerate()
            .map(|(index, ss)| ss.or_else(|| max_slots.get(index).cloned().flatten()))
            .collect();

        AirSquadron {
            id: id.unwrap_or_default(),
            xxh3,
            mode: mode.unwrap_or_default(),
            gears,
            slots,
            max_slots,
        }
    }

    pub fn create_org(&self, input: Option<OrgState>) -> Option<Org> {
        let state = input?;
        let xxh3 = xxh3(&state);

        let OrgState {
            id,
            f1,
            f2,
            f3,
            f4,
            a1,
            a2,
            a3,
            hq_level,
            org_type,
        } = state;

        let f1 = self.create_fleet(f1);
        let f2 = self.create_fleet(f2);
        let f3 = self.create_fleet(f3);
        let f4 = self.create_fleet(f4);

        let org_type = org_type.unwrap_or_else(|| {
            if f1.len() == 0 {
                return OrgType::Single;
            }

            let is_abyssal = f1
                .ships
                .values()
                .chain(f2.ships.values())
                .any(|ship| ship.is_abyssal());

            if !is_abyssal {
                OrgType::Single
            } else if f2.len() > 0 {
                OrgType::EnemyCombined
            } else {
                OrgType::EnemySingle
            }
        });

        Some(Org {
            xxh3,
            id: id.unwrap_or_default(),

            f1,
            f2,
            f3,
            f4,

            a1: self.create_air_squadron(a1),
            a2: self.create_air_squadron(a2),
            a3: self.create_air_squadron(a3),

            hq_level: hq_level.unwrap_or(120),
            org_type,
        })
    }

    pub fn create_ship_by_id(&self, ship_id: u16) -> Option<Ship> {
        let master_ship = self
            .master_data
            .ships
            .iter()
            .find(|ship| ship.ship_id == ship_id)?;

        let state = if master_ship.has_attr(ShipAttr::Abyssal) {
            let stock = &master_ship.stock;
            ShipState {
                ship_id,
                g1: stock.get(0).cloned(),
                g2: stock.get(1).cloned(),
                g3: stock.get(2).cloned(),
                g4: stock.get(3).cloned(),
                g5: stock.get(4).cloned(),
                gx: stock.get(5).cloned(),
                ..Default::default()
            }
        } else {
            ShipState {
                ship_id,
                ..Default::default()
            }
        };

        self.create_ship(Some(state))
    }
}
