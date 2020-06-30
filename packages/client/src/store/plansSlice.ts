import { createSlice, createEntityAdapter, PayloadAction, EntitySelectors } from "@reduxjs/toolkit"
import { PlanState } from "@fleethub/core"
import { DefaultRootState } from "react-redux"

import { filesSlice } from "./filesSlice"
import { selectEntites } from "./selectEntites"
import { makeActionMatcher } from "./makeActionMatcher"

type PlanStateWithId = PlanState & { id: string }

const plansAdapter = createEntityAdapter<PlanStateWithId>()
export const plansSelectors: EntitySelectors<PlanStateWithId, DefaultRootState> = plansAdapter.getSelectors(
  (state) => selectEntites(state).plans
)

export const plansSlice = createSlice({
  name: "plans",
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
        const { plan } = payload

        if (!plan.name) {
          plan.name = `編成${state.ids.length + 1}`
        }

        plansAdapter.addOne(state, plan)
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
