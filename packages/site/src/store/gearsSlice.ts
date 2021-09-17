import { GearKey } from "@fh/utils";
import { createSlice } from "@reduxjs/toolkit";
import { gearsAdapter } from "./adapters";
import { isEntitiesAction, sweep } from "./entities";
import { createGear } from "./gearSelectSlice";

export type GearPosition =
  | { tag: "ship"; key: GearKey; id: string }
  | { tag: "airSquadron"; key: GearKey; id: string };

export const gearsSlice = createSlice({
  name: "entities/gears",
  initialState: gearsAdapter.getInitialState(),
  reducers: {
    update: gearsAdapter.updateOne,
    remove: gearsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createGear, (state, { payload }) => {
        gearsAdapter.addOne(state, payload.gear);
      })
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
