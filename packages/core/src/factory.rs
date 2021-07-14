use crate::{
    air_squadron::{AirSquadron, AirSquadronState},
    array::{GearArray, ShipArray},
    fleet::{Fleet, FleetState},
    gear::{Gear, GearState},
    org::{Org, OrgState},
    ship::Ship,
    ship::ShipState,
    types::MasterData,
    utils::xxh3,
};

pub struct Factory {
    pub master_data: MasterData,
}

impl Factory {
    pub fn create_gear(&self, input: Option<GearState>) -> Option<Gear> {
        let state = input?;

        let master = self
            .master_data
            .gears
            .iter()
            .find(|mg| mg.gear_id == state.gear_id)?;

        let attrs = self.master_data.find_gear_attrs(master);
        let ibonuses = self
            .master_data
            .get_ibonuses(master, state.stars.unwrap_or_default());

        Some(Gear::new(state, master, attrs, ibonuses))
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

        let master = self
            .master_data
            .ships
            .iter()
            .find(|ship| ship.ship_id == state.ship_id)?;

        let attrs = self.master_data.find_ship_attrs(&master);

        let equippable = self.master_data.create_ship_equippable(&master);

        let banner = self
            .master_data
            .ship_banners
            .get(&state.ship_id.to_string())
            .cloned();

        Some(Ship::new(state, master, attrs, equippable, banner, gears))
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
            g1,
            g2,
            g3,
            g4,
            ss1,
            ss2,
            ss3,
            ss4,
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

        let slots = [ss1, ss2, ss3, ss4]
            .iter()
            .cloned()
            .map(|ss| ss.or(Some(18)))
            .collect();

        AirSquadron {
            id: id.unwrap_or_default(),
            xxh3,
            gears,
            slots,
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
            side,
        } = state;

        Some(Org {
            xxh3,
            id: id.unwrap_or_default(),

            f1: self.create_fleet(f1),
            f2: self.create_fleet(f2),
            f3: self.create_fleet(f3),
            f4: self.create_fleet(f4),

            a1: self.create_air_squadron(a1),
            a2: self.create_air_squadron(a2),
            a3: self.create_air_squadron(a3),

            hq_level: hq_level.unwrap_or(120),
            org_type: org_type.unwrap_or_default(),
            side: side.unwrap_or_default(),
        })
    }
}
