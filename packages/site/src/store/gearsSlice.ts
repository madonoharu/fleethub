import { GearKey } from "@fh/utils";
import { createSlice } from "@reduxjs/toolkit";
import { gearsAdapter } from "./adapters";
import { isEntitiesAction, sweep } from "./entities";

export type GearPosition =
  | { tag: "ship"; key: GearKey; id: string }
  | { tag: "airSquadron"; key: GearKey; id: string }
  | { tag: "preset"; key: GearKey; id: string };

export const gearsSlice = createSlice({
  name: "entities/gears",
  initialState: gearsAdapter.getInitialState(),
  reducers: {
    update: gearsAdapter.updateOne,
    updateMany: gearsAdapter.updateMany,
    remove: gearsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(sweep, (state, { payload }) => {
        gearsAdapter.removeMany(state, payload.gears);
      })
      .addMatcher(isEntitiesAction, (state, { payload }) => {
        const { gears } = payload.entities;
        if (gears) {
          gearsAdapter.addMany(state, gears);
        }
      });
  },
});
