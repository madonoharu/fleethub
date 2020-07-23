import { createSlice, createEntityAdapter, PayloadAction, EntitySelectors } from "@reduxjs/toolkit"
import { PlanState } from "@fleethub/core"
import { DefaultRootState } from "react-redux"

import { filesSlice } from "./filesSlice"
import { selectPlansState } from "./selectors"
import { makeActionMatcher } from "./makeActionMatcher"

type PlanStateWithId = PlanState & { id: string }

const plansAdapter = createEntityAdapter<PlanStateWithId>()
export const plansSelectors: EntitySelectors<PlanStateWithId, DefaultRootState> = plansAdapter.getSelectors(
  selectPlansState
)

export const plansSlice = createSlice({
  name: "entities/plans",
  initialState: plansAdapter.getInitialState(),
  reducers: {
    set: (state, { payload }: PayloadAction<PlanStateWithId>) => {
      state.entities[payload.id] = payload
    },

    update: plansAdapter.updateOne,
  },

  extraReducers: (builder) => {
    builder
      .addCase(filesSlice.actions.createPlan, (state, { payload }) => {
        plansAdapter.addOne(state, payload.plan)
      })

      .addCase(filesSlice.actions.remove, plansAdapter.removeMany)

      .addMatcher(
        makeActionMatcher(filesSlice.actions.set, filesSlice.actions.import),
        (state, { payload: { plans } }) => {
          if (plans) plansAdapter.addMany(state, plans)
        }
      )
  },
})
