import { FleetParams } from "@fleethub/core";
import { FhEntity, ShipKey } from "@fleethub/utils";
import { createEntityAdapter, createSlice, nanoid } from "@reduxjs/toolkit";
import { DefaultRootState } from "react-redux";

import { filesSlice } from "./filesSlice";
import { getPresentState } from "./selectors";
import { shipsSlice } from "./shipsSlice";

export type FleetEntity = FhEntity<FleetParams, ShipKey>;

const adapter = createEntityAdapter<FleetEntity>();

export const fleetsSelectors = adapter.getSelectors(
  (root: DefaultRootState) => getPresentState(root).fleets
);

export const fleetsSlice = createSlice({
  name: "fleets",
  initialState: adapter.getInitialState(),
  reducers: {
    add: {
      reducer: adapter.addOne,
      prepare: () => {
        return { payload: { id: nanoid() } };
      },
    },
    remove: adapter.removeOne,
  },

  extraReducers: (builder) => {
    builder
      .addCase(shipsSlice.actions.add, (state, { payload, meta }) => {
        const position = meta.fleet;
        const entity = position && state.entities[position.id];
        if (!position || !entity) return;

        entity[position.key] = payload.id;
      })
      .addCase(filesSlice.actions.createPlan, (state, { meta }) => {
        adapter.addMany(state, [
          { id: meta.f1 },
          { id: meta.f2 },
          { id: meta.f3 },
          { id: meta.f4 },
        ]);
      });
  },
});
