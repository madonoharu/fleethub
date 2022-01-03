import { createSlice } from "@reduxjs/toolkit";

import { getSliceName, ormAdapters } from "./base";

const key = "steps";
const adapter = ormAdapters[key];
const sliceName = getSliceName(key);

export const stepsSlice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    update: adapter.updateOne,
    remove: adapter.removeOne,
  },
});
