import { createSlice } from "@reduxjs/toolkit";

import { ormAdapters, getSliceName } from "./base";

const key = "gears";
const adapter = ormAdapters[key];
const sliceName = getSliceName(key);

export const gearsSlice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    update: adapter.updateOne,
    updateMany: adapter.updateMany,
    remove: adapter.removeOne,
  },
});
