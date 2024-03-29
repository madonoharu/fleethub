use std::hash::Hasher;

use hashbrown::hash_map::DefaultHashBuilder;
use seq_macro::seq;

use crate::{
    air_squadron::AirSquadron,
    comp::Comp,
    fleet::{Fleet, ShipArray},
    gear::Gear,
    gear_array::GearArray,
    master_data::MasterData,
    org::Org,
    ship::Ship,
    types::{
        AirSquadronState, EBonuses, FleetState, GearAttr, GearState, GearType, GearVecState,
        OrgState, OrgType, ShipState, SlotSizeVec,
    },
};

pub struct Factory {
    pub master_data: MasterData,
    hash_builder: DefaultHashBuilder,
}

impl Factory {
    pub fn new(master_data: MasterData) -> Self {
        Self {
            master_data,
            hash_builder: DefaultHashBuilder::default(),
        }
    }

    fn make_hash<T: std::hash::Hash>(&self, val: &T) -> u64 {
        use std::hash::BuildHasher;
        let mut state = self.hash_builder.build_hasher();
        val.hash(&mut state);
        state.finish()
    }

    pub fn create_gear(&self, input: Option<GearState>) -> Option<Gear> {
        let state = input?;
        let hash = self.make_hash(&state);

        let master_gear = self
            .master_data
            .gears
            .iter()
            .find(|mg| mg.gear_id == state.gear_id)?;

        let ibonuses = self
            .master_data
            .get_ibonuses(master_gear, state.stars.unwrap_or_default());

        Some(Gear::new(hash, state, master_gear, ibonuses))
    }

    pub fn create_ship(&self, input: Option<ShipState>) -> Option<Ship> {
        let state = input?;
        let hash = self.make_hash(&state);

        let gears = state
            .gears
            .iter()
            .map(|g| self.create_gear(g.cloned()))
            .collect::<GearArray>();

        let master_ship = self
            .master_data
            .ships
            .iter()
            .find(|ship| ship.ship_id == state.ship_id)?;

        let equippability = self.master_data.create_ship_equippability(master_ship);

        let ebonuses: EBonuses = if gears.has_by(|gear| !gear.is_abyssal()) {
            EBonuses::new(master_ship, &gears)
        } else {
            Default::default()
        };

        let ship = Ship::new(hash, state, master_ship, equippability, gears, ebonuses);

        Some(ship)
    }

    pub fn create_fleet(&self, input: Option<FleetState>) -> Fleet {
        let state = input.unwrap_or_default();
        let hash = self.make_hash(&state);

        let FleetState {
            id,
            len,
            s1,
            s2,
            s3,
            s4,
            s5,
            s6,
            s7,
        } = state;

        let len = len.unwrap_or_else(|| if s7.is_some() { 7 } else { 6 });

        let ships = [s1, s2, s3, s4, s5, s6, s7]
            .into_iter()
            .take(len)
            .map(|state| self.create_ship(state))
            .collect::<ShipArray>();

        Fleet {
            id: id.unwrap_or_default(),
            len,
            hash,
            ships,
        }
    }

    pub fn create_air_squadron(&self, input: Option<AirSquadronState>) -> AirSquadron {
        let state = input.unwrap_or_default();
        let hash = self.make_hash(&state);

        let gears = state
            .gears
            .into_iter()
            .map(|gear| self.create_gear(gear))
            .collect::<GearArray>();

        let max_slots: SlotSizeVec = (0..4)
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

        let slots = state
            .slots
            .into_iter()
            .enumerate()
            .map(|(index, ss)| ss.or_else(|| max_slots.get(index).cloned().flatten()))
            .collect();

        AirSquadron {
            id: state.id.unwrap_or_default(),
            hash,
            mode: state.mode.unwrap_or_default(),
            gears,
            slots,
            max_slots,
        }
    }

    pub fn create_org(&self, input: Option<OrgState>) -> Option<Org> {
        let state = input?;
        let hash = self.make_hash(&state);

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
            sortie,
            route_sup,
            boss_sup,
        } = state;

        let f1 = self.create_fleet(f1);
        let f2 = self.create_fleet(f2);
        let f3 = self.create_fleet(f3);
        let f4 = self.create_fleet(f4);

        let org_type = org_type.unwrap_or_else(|| {
            if f1.count_ships() == 0 {
                return OrgType::Single;
            }

            let is_abyssal = f1
                .ships
                .values()
                .chain(f2.ships.values())
                .any(|ship| ship.is_abyssal());

            if !is_abyssal {
                OrgType::Single
            } else if f2.count_ships() > 0 {
                OrgType::EnemyCombined
            } else {
                OrgType::EnemySingle
            }
        });

        Some(Org {
            id: id.unwrap_or_default(),
            hash,

            f1,
            f2,
            f3,
            f4,

            a1: self.create_air_squadron(a1),
            a2: self.create_air_squadron(a2),
            a3: self.create_air_squadron(a3),

            hq_level: hq_level.unwrap_or(120),
            org_type,
            sortie: sortie.unwrap_or_default(),
            route_sup,
            boss_sup,
        })
    }

    pub fn create_ship_state_by_id(&self, ship_id: u16) -> Option<ShipState> {
        let master_ship = self
            .master_data
            .ships
            .iter()
            .find(|ship| ship.ship_id == ship_id)?;

        let state = if master_ship.is_abyssal() {
            let stock = &master_ship.stock;
            let gears = GearVecState {
                g1: stock.get(0).cloned(),
                g2: stock.get(1).cloned(),
                g3: stock.get(2).cloned(),
                g4: stock.get(3).cloned(),
                g5: stock.get(4).cloned(),
                gx: stock.get(5).cloned(),
            };

            ShipState {
                ship_id,
                gears,
                ..Default::default()
            }
        } else {
            ShipState {
                ship_id,
                ..Default::default()
            }
        };

        Some(state)
    }

    pub fn create_ship_by_id(&self, ship_id: u16) -> Option<Ship> {
        self.create_ship(self.create_ship_state_by_id(ship_id))
    }

    pub fn create_fleet_by_ids(&self, ids: Vec<u16>) -> Fleet {
        let create_ship_state = |index: usize| {
            ids.get(index)
                .and_then(|ship_id| self.create_ship_state_by_id(*ship_id))
        };

        #[allow(clippy::eq_op)]
        let state = seq!(N in 1..=7 {
            FleetState {
                id: None,
                len: Some(ids.len()),
                #(

                    s ~N: create_ship_state(N - 1),
                )*
            }
        });

        self.create_fleet(Some(state))
    }

    pub fn create_comp_by_map_enemy(&self, main: Vec<u16>, escort: Option<Vec<u16>>) -> Comp {
        let main_fleet = self.create_fleet_by_ids(main);
        let escort_fleet = escort.map(|vec| self.create_fleet_by_ids(vec));

        let org_type = if escort_fleet.is_some() {
            OrgType::EnemyCombined
        } else {
            OrgType::EnemySingle
        };

        Comp {
            hq_level: 120,
            org_type,
            main: main_fleet,
            escort: escort_fleet,
            route_sup: None,
            boss_sup: None,
        }
    }
}
