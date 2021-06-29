import { AirSquadronKey, FhEntity, PlanState, Role } from "@fleethub/utils";
import {
  createEntityAdapter,
  createSlice,
  EntitySelectors,
  PayloadAction,
} from "@reduxjs/toolkit";
import { DefaultRootState } from "react-redux";

import { filesSlice } from "./filesSlice";
import { makeActionMatcher } from "./makeActionMatcher";

export type PlanEntity = FhEntity<PlanState, Role | AirSquadronKey>;

const selectPlansState = (root: DefaultRootState) => root.present.plans;

const plansAdapter = createEntityAdapter<PlanEntity>();
export const plansSelectors: EntitySelectors<PlanEntity, DefaultRootState> =
  plansAdapter.getSelectors(selectPlansState);

export const plansSlice = createSlice({
  name: "entities/plans",
  initialState: plansAdapter.getInitialState(),
  reducers: {
    set: (state, { payload }: PayloadAction<PlanEntity>) => {
      state.entities[payload.id] = payload;
    },

    update: plansAdapter.updateOne,
  },

  extraReducers: (builder) => {
    builder
      .addCase(filesSlice.actions.createPlan, (state, { payload, meta }) => {
        plansAdapter.addOne(state, { ...payload.plan, ...meta });
      })

      .addCase(filesSlice.actions.remove, plansAdapter.removeMany)

      .addMatcher(
        makeActionMatcher(filesSlice.actions.set, filesSlice.actions.add),
        (state, { payload }) => {
          const { plans } = payload.data;
          if (plans) plansAdapter.addMany(state, plans);
        }
      );
  },
});
