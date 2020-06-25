import { createSlice, createEntityAdapter, PayloadAction, current, EntitySelectors } from "@reduxjs/toolkit"
import { PlanState } from "@fleethub/core"
import { DefaultRootState } from "react-redux"
import { filesSlice } from "./filesSlice"
import { isNonNullable } from "@fleethub/utils"

type PlanStateWithId = PlanState & { id: string }

const plansAdapter = createEntityAdapter<PlanStateWithId>()
export const plansSelectors: EntitySelectors<PlanStateWithId, DefaultRootState> = plansAdapter.getSelectors(
  (state) => state.plans
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
      .addCase(filesSlice.actions.clone, (state, { payload }) => {
        const clonedPlans = payload.changes
          .map(([sourceId, clonedId]) => {
            const source = state.entities[sourceId]
            if (!source) return
            return { ...current(source), id: clonedId }
          })
          .filter(isNonNullable)

        plansAdapter.addMany(state, clonedPlans)
      })
      .addCase(filesSlice.actions.remove, plansAdapter.removeMany)
  },
})
