import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ormAdapters, getSliceName } from "./base";

const key = "ships";
const adapter = ormAdapters[key];
const sliceName = getSliceName(key);

export const shipsSlice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    update: adapter.updateOne,
    updateMany: adapter.updateMany,
    remove: adapter.removeOne,
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
        payload.map((id) => ({
          id,
          changes,
        }))
      );
    },
  },
});
