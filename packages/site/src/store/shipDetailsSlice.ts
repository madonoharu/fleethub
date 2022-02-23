import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  WarfareAnalyzerShipEnvironment,
  AirState,
  Engagement,
} from "fleethub-core";

import {
  initalNightSituation,
  initalCustomModifiers,
  entitiesSlice,
} from "./entities";

export type ShipDetailsState = {
  enemies: string[];
  player: WarfareAnalyzerShipEnvironment;
  enemy: WarfareAnalyzerShipEnvironment;
  air_state: AirState;
  engagement: Engagement;
};

const initialShipEnv: WarfareAnalyzerShipEnvironment = {
  org_type: "Single",
  role: "Main",
  fleet_len: 6,
  ship_index: 0,
  formation: "LineAhead",
  fleet_los_mod: 0,
  night_situation: initalNightSituation,
  custom_mods: initalCustomModifiers,
};

const initialState: ShipDetailsState = {
  enemies: [],
  player: initialShipEnv,
  enemy: initialShipEnv,
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
