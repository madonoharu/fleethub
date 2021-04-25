import {
  createEntityAdapter,
  createSlice,
  EntitySelectors,
  PayloadAction,
} from "@reduxjs/toolkit";
import { DefaultRootState } from "react-redux";

import { filesSlice, PlanStateWithId } from "./filesSlice";
import { makeActionMatcher } from "./makeActionMatcher";
import { selectPlansState } from "./selectors";

const plansAdapter = createEntityAdapter<PlanStateWithId>();
export const plansSelectors: EntitySelectors<
  PlanStateWithId,
  DefaultRootState
> = plansAdapter.getSelectors(selectPlansState);

export const plansSlice = createSlice({
  name: "entities/plans",
  initialState: plansAdapter.getInitialState(),
  reducers: {
    set: (state, { payload }: PayloadAction<PlanStateWithId>) => {
      state.entities[payload.id] = payload;
    },

    update: plansAdapter.updateOne,
  },

  extraReducers: (builder) => {
    builder
      .addCase(filesSlice.actions.createPlan, (state, { payload }) => {
        plansAdapter.addOne(state, payload.plan);
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
