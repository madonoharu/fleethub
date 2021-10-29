import { createSlice } from "@reduxjs/toolkit";

import { stepsAdapter } from "./adapters";
import { sweep, isEntitiesAction } from "./entities";

export const stepsSlices = createSlice({
  name: "entities/steps",
  initialState: stepsAdapter.getInitialState(),
  reducers: {
    update: stepsAdapter.updateOne,
    remove: stepsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(sweep, (state, action) => {
        stepsAdapter.removeMany(state, action.payload.steps);
      })
      .addMatcher(isEntitiesAction, (state, action) => {
        const { steps } = action.payload.entities;
        if (steps) {
          stepsAdapter.addMany(state, steps);
        }
      });
  },
});
