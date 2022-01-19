import { createSlice } from "@reduxjs/toolkit";

import { getSliceName, ormAdapters } from "./base";

const key = "presets";
const adapter = ormAdapters[key];
const sliceName = getSliceName(key);

export const presetsSlice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),

  reducers: {
    add: adapter.addOne,
    update: adapter.updateOne,
    remove: adapter.removeOne,
  },
});
