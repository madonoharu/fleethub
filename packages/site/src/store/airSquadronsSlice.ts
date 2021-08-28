import { createSlice } from "@reduxjs/toolkit";

import { airSquadronsAdapter } from "./adapters";
import { isEntitiesAction, sweep } from "./entities";
import { gearsSlice } from "./gearsSlice";

export const airSquadronsSlice = createSlice({
  name: "entities/airSquadrons",
  initialState: airSquadronsAdapter.getInitialState(),
  reducers: {
    update: airSquadronsAdapter.updateOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(gearsSlice.actions.add, (state, { payload, meta }) => {
        const { position } = meta;
        const entity =
          "airSquadron" in position &&
          position.airSquadron &&
          state.entities[position.airSquadron];
        if (!entity) return;

        entity[position.key as "g1"] = payload.id;
      })
      .addCase(sweep, (state, { payload }) => {
        airSquadronsAdapter.removeMany(state, payload.airSquadrons);
      })
      .addMatcher(isEntitiesAction, (state, { payload }) => {
        const { airSquadrons } = payload.entities;
        if (airSquadrons) airSquadronsAdapter.addMany(state, airSquadrons);
      });
  },
});
