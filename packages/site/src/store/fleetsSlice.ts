import { createSlice, nanoid } from "@reduxjs/toolkit";

import { fleetsAdapter } from "./adapters";
import { sweep } from "./entities";
import { isEntitiesAction } from "./filesSlice";
import { shipsSlice } from "./shipsSlice";

export const fleetsSlice = createSlice({
  name: "entities/fleets",
  initialState: fleetsAdapter.getInitialState(),
  reducers: {
    add: {
      reducer: fleetsAdapter.addOne,
      prepare: () => {
        return { payload: { id: nanoid() } };
      },
    },
    remove: fleetsAdapter.removeOne,
  },

  extraReducers: (builder) => {
    builder
      .addCase(shipsSlice.actions.add, (state, { payload, meta }) => {
        const position = meta.fleet;
        const entity = position && state.entities[position.id];
        if (!position || !entity) return;

        entity[position.key] = payload.id;
      })
      .addCase(sweep, (state, { payload }) => {
        fleetsAdapter.removeMany(state, payload.fleets);
      })
      .addMatcher(isEntitiesAction, (state, { payload }) => {
        const { fleets } = payload.entities;
        if (fleets) fleetsAdapter.addMany(state, fleets);
      });
  },
});
