import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ShipEnvironment, AirState, Engagement } from "fleethub-core";

import { entitiesSlice } from "./entities";

export type ShipDetailsState = {
  enemies: string[];
  player: ShipEnvironment;
  enemy: ShipEnvironment;
  air_state: AirState;
  engagement: Engagement;
};

const initialState: ShipDetailsState = {
  enemies: [],
  player: {},
  enemy: {},
  air_state: "AirSupremacy",
  engagement: "Parallel",
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
