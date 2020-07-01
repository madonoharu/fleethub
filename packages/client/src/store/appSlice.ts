import { createSlice, PayloadAction, AppThunk } from "@reduxjs/toolkit"

import { filesSlice } from "./filesSlice"
import { plansSelectors } from "./plansSlice"

type AppState = {
  planId?: string
}

const initialState: AppState = {}

export const appSlice = createSlice({
  name: "app",
  initialState,

  reducers: {
    openPlan: (state, { payload }: PayloadAction<string>) => {
      state.planId = payload
    },
    closePlan: (state) => {
      delete state.planId
    },
  },

  extraReducers: (bapplder) => {
    bapplder
      .addCase(filesSlice.actions.createPlan, (state, { payload }) => {
        state.planId = payload.plan.id
      })
      .addCase(filesSlice.actions.import, (state, { payload: { plans, entry } }) => {
        if (plans?.length === 0) return
        state.planId = entry
      })
  },
})

export const openFirstPlan = (): AppThunk => (dispatch, getState) => {
  const state = getState()
  const planIds = plansSelectors.selectIds(state)

  if (planIds.length) {
    dispatch(appSlice.actions.openPlan(planIds[planIds.length - 1] as string))
  } else {
    dispatch(filesSlice.actions.createPlan({}))
  }
}
