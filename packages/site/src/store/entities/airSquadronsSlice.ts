import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ormAdapters, getSliceName, resetSlotSize } from "./base";

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
    resetSlotSize,
  },
});
