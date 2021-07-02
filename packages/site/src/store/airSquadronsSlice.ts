import { AirSquadronParams } from "@fleethub/core";
import { FhEntity, GearKey, SlotSizeKey } from "@fleethub/utils";
import {
  createEntityAdapter,
  createSlice,
  EntitySelectors,
} from "@reduxjs/toolkit";
import { DefaultRootState } from "react-redux";

import { filesSlice } from "./filesSlice";
import { gearsSlice } from "./gearsSlice";

export type AirSquadronEntity = FhEntity<
  AirSquadronParams,
  (GearKey | SlotSizeKey) & keyof AirSquadronParams
>;

const adapter = createEntityAdapter<AirSquadronEntity>();

export const airSquadronsSelectors: EntitySelectors<
  AirSquadronEntity,
  DefaultRootState
> = adapter.getSelectors((root) => root.present.airSquadrons);

export const airSquadronsSlice = createSlice({
  name: "airSquadron",
  initialState: adapter.getInitialState(),
  reducers: {
    update: adapter.updateOne,
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
      .addCase(filesSlice.actions.createPlan, (state, { meta }) => {
        adapter.addMany(state, [
          { id: meta.a1 },
          { id: meta.a2 },
          { id: meta.a3 },
        ]);
      });
  },
});
