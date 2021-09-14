import { pick, GEAR_KEYS } from "@fh/utils";
import { createSlice, EntityState } from "@reduxjs/toolkit";

import { shipsAdapter } from "./adapters";
import {
  createShip,
  isEntitiesAction,
  swapGearPosition,
  sweep,
} from "./entities";
import { GearPosition, gearsSlice } from "./gearsSlice";
import { exclude } from "./matchers";
import { ShipEntity } from "./schema";

const setGearId = (
  state: EntityState<ShipEntity>,
  position: GearPosition,
  id: string | undefined
) => {
  if (!("ship" in position)) return;
  const entity = state.entities[position.ship];

  if (entity) {
    entity[position.key] = id;
  }
};

export const shipsSlice = createSlice({
  name: "entities/ships",
  initialState: shipsAdapter.getInitialState(),
  reducers: {
    update: shipsAdapter.updateOne,
    remove: shipsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(gearsSlice.actions.add, (state, { payload, meta }) => {
        const { position } = meta;

        setGearId(state, position, payload.id);
      })
      .addCase(swapGearPosition, (state, { payload }) => {
        const { drag, drop } = payload;

        setGearId(state, drag.position, drop.id);
        setGearId(state, drop.position, drag.id);
      })
      .addCase(sweep, (state, { payload }) => {
        shipsAdapter.removeMany(state, payload.ships);
      })
      .addCase(createShip, (state, { payload }) => {
        const current = state.entities[payload.id];
        const ship = payload.entities.ships?.[payload.id];

        if (!ship) return;

        if (payload.reselect && current) {
          const next: ShipEntity = {
            id: ship.id,
            ship_id: ship.ship_id,
            ...pick(current, GEAR_KEYS),
          };

          shipsAdapter.setOne(state, next);
        } else {
          shipsAdapter.setOne(state, ship);
        }
      })
      .addMatcher(exclude(isEntitiesAction, createShip), (state, action) => {
        const { ships } = action.payload.entities;

        if (!ships) return;
        shipsAdapter.addMany(state, ships);
      });
  },
});
