import { createSlice, nanoid } from "@reduxjs/toolkit";

import { fleetsAdapter } from "./adapters";
import { createShip, isEntitiesAction, sweep } from "./entities";

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
      .addCase(createShip, (state, { payload }) => {
        const position = payload.position;
        const entity = position?.fleet && state.entities[position.fleet];

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
