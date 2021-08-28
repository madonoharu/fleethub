import { pick, GEAR_KEYS } from "@fleethub/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { shipsAdapter } from "./adapters";
import { createShip, isEntitiesAction, sweep } from "./entities";
import { gearsSlice } from "./gearsSlice";
import { exclude } from "./matchers";
import { ShipEntity } from "./schema";

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
        const entity =
          "ship" in position && position.ship && state.entities[position.ship];
        if (!entity) return;

        entity[position.key] = payload.id;
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
