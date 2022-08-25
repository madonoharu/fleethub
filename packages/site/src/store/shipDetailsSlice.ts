import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ShipAnalyzerConfig } from "fleethub-core";

import { entitiesSlice } from "./entities";

export interface ShipDetailsState extends ShipAnalyzerConfig {
  enemies: string[];
}

const initialState: ShipDetailsState = {
  enemies: [],
};

export const shipDetailsSlice = createSlice({
  name: "shipDetails",
  initialState,

  reducers: {
    update: (state, { payload }: PayloadAction<Partial<ShipDetailsState>>) => {
      Object.assign(state, payload);
    },
  },

  extraReducers: (builder) => {
    builder.addCase(entitiesSlice.actions.createShip, (state, { payload }) => {
      if (payload.position?.tag === "shipDetails" && payload.id) {
        state.enemies.push(payload.id);
      }
    });
  },
});
