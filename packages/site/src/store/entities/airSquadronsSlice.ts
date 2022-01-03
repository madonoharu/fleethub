import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ormAdapters, getSliceName } from "./base";

const key = "airSquadrons";
const adapter = ormAdapters[key];
const sliceName = getSliceName(key);

export const airSquadronsSlice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    update: adapter.updateOne,
    reset: (state, { payload }: PayloadAction<string[]>) => {
      adapter.setMany(
        state,
        payload.map((id) => ({ id }))
      );
    },
    resetSlotSize: (state, { payload }: PayloadAction<string[]>) => {
      const changes = {
        ss1: undefined,
        ss2: undefined,
        ss3: undefined,
        ss4: undefined,
        ss5: undefined,
      };

      adapter.updateMany(
        state,
        payload.map((id) => ({ id, changes }))
      );
    },
  },
});
