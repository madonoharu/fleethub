import { OrgParams } from "@fleethub/core";
import { AirSquadronKey, FhEntity, FleetKey } from "@fleethub/utils";
import {
  createEntityAdapter,
  createSlice,
  EntitySelectors,
  PayloadAction,
} from "@reduxjs/toolkit";
import { DefaultRootState } from "react-redux";

import { filesSlice } from "./filesSlice";
import { makeActionMatcher } from "./makeActionMatcher";

export type OrgEntity = FhEntity<OrgParams, FleetKey | AirSquadronKey>;

const selectOrgsState = (root: DefaultRootState) => root.present.orgs;

const orgsAdapter = createEntityAdapter<OrgEntity>();
export const orgsSelectors: EntitySelectors<OrgEntity, DefaultRootState> =
  orgsAdapter.getSelectors(selectOrgsState);

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
      .addCase(filesSlice.actions.createPlan, (state, { payload, meta }) => {
        orgsAdapter.addOne(state, { id: payload.org.id, ...meta });
      })

      .addCase(filesSlice.actions.remove, orgsAdapter.removeMany)

      .addMatcher(
        makeActionMatcher(filesSlice.actions.set, filesSlice.actions.add),
        () => {
          throw "todo";
        }
      );
  },
});
