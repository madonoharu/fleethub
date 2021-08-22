import { pick, ShipKey, GEAR_KEYS } from "@fleethub/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { shipsAdapter } from "./adapters";
import { sweep } from "./entities";
import { isEntitiesAction } from "./filesSlice";
import { gearsSlice } from "./gearsSlice";
import { ShipEntity } from "./schema";

export type ShipPosition = { id: string; key: ShipKey };

export const shipsSlice = createSlice({
  name: "entities/ships",
  initialState: shipsAdapter.getInitialState(),
  reducers: {
    add: {
      reducer: shipsAdapter.addOne,
      prepare: (state: ShipEntity, to: ShipPosition) => ({
        payload: state,
        meta: { fleet: to },
      }),
    },
    reselect: (
      state,
      action: PayloadAction<{ id: string; ship_id: number }>
    ) => {
      const { id, ship_id } = action.payload;
      const current = state.entities[id];

      if (current) {
        const next: ShipEntity = {
          id,
          ship_id,
          ...pick(current, GEAR_KEYS),
        };

        shipsAdapter.setOne(state, next);
      } else {
        shipsAdapter.addOne(state, { id, ship_id });
      }
    },
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
      .addMatcher(isEntitiesAction, (state, { payload }) => {
        const { ships } = payload.entities;
        if (ships) {
          shipsAdapter.addMany(state, ships);
        }
      });
  },
});
