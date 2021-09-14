import {
  WarfareShipEnvironment,
  NightSituation,
  AirState,
  Engagement,
} from "@fh/core";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createShip } from "./entities";

export type WarfareAnalysisShipParams = WarfareShipEnvironment & NightSituation;

export type ShipDetailsState = {
  enemies: string[];
  player: WarfareAnalysisShipParams;
  enemy: WarfareAnalysisShipParams;
  air_state: AirState;
  engagement: Engagement;
};

const initialShipParams: WarfareAnalysisShipParams = {
  org_type: "Single",
  role: "Main",
  fleet_len: 6,
  ship_index: 0,
  formation: "LineAhead",
  fleet_los_mod: 0,
  night_contact_rank: null,
  starshell: false,
  searchlight: false,
};

const initialState: ShipDetailsState = {
  enemies: [],
  player: initialShipParams,
  enemy: initialShipParams,
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
    builder.addCase(createShip, (state, { payload }) => {
      const { position } = payload;
      if (position?.tag !== "shipDetails") return;

      state.enemies.push(payload.id);
    });
  },
});
