import { GearParams } from "@fleethub/core";
import { GearKey } from "@fleethub/utils";
import { createSlice, nanoid } from "@reduxjs/toolkit";
import { gearsAdapter } from "./adapters";
import { isEntitiesAction, sweep } from "./entities";

export type GearPosition =
  | { id?: string; ship: string; key: GearKey }
  | { id?: string; airSquadron: string; key: GearKey };

export const gearsSlice = createSlice({
  name: "entities/gears",
  initialState: gearsAdapter.getInitialState(),
  reducers: {
    add: {
      reducer: gearsAdapter.addOne,
      prepare: (position: GearPosition, state: GearParams) => ({
        payload: { ...state, id: nanoid() },
        meta: { position },
      }),
    },
    update: gearsAdapter.updateOne,
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
