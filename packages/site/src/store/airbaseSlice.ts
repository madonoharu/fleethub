import { Dict, GearKey, SlotSizeKey } from "@fleethub/utils";
import { createEntityAdapter, createSlice, EntityId } from "@reduxjs/toolkit";

import { gearsSlice } from "./gearsSlice";

export type AirbaseEntity = {
  id: EntityId;
} & Dict<GearKey, string> &
  Dict<SlotSizeKey, number>;

const adapter = createEntityAdapter<AirbaseEntity>();

export const airbasesSlice = createSlice({
  name: "airbases",
  initialState: adapter.getInitialState(),
  reducers: {
    update: adapter.updateOne,
  },
  extraReducers: (builder) => {
    builder.addCase(gearsSlice.actions.add, (state, { payload, meta }) => {
      const { position } = meta;
      const entity =
        "airbase" in position &&
        position.airbase &&
        state.entities[position.airbase];
      if (!entity) return;

      entity[position.key] = payload.id;
    });
  },
});
