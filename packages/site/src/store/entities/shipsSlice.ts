import { createSlice } from "@reduxjs/toolkit";

import { ormAdapters, getSliceName, resetSlotSize } from "./base";

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
    resetSlotSize,
  },
});
