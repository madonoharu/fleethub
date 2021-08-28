import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { orgsAdapter } from "./adapters";
import { isEntitiesAction, sweep } from "./entities";
import { OrgEntity } from "./schema";

export const orgsSlice = createSlice({
  name: "entities/orgs",
  initialState: orgsAdapter.getInitialState(),
  reducers: {
    set: (state, { payload }: PayloadAction<OrgEntity>) => {
      state.entities[payload.id] = payload;
    },

    update: orgsAdapter.updateOne,
  },

  extraReducers: (builder) => {
    builder
      .addCase(sweep, (state, { payload }) => {
        orgsAdapter.removeMany(state, payload.orgs);
      })
      .addMatcher(isEntitiesAction, (state, { payload }) => {
        if (payload.entities.orgs) {
          orgsAdapter.addMany(state, payload.entities.orgs);
        }
      });
  },
});
