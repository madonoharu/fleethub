import { createSlice, PayloadAction, AppThunk } from "@reduxjs/toolkit"

import { filesSlice } from "./filesSlice"
import { plansSelectors } from "./plansSlice"

type AppState = {
  fileId?: string
}

const initialState: AppState = {}

export const appSlice = createSlice({
  name: "app",
  initialState,

  reducers: {
    openFile: (state, { payload }: PayloadAction<string>) => {
      state.fileId = payload
    },
    closeFile: (state) => {
      delete state.fileId
    },
  },

  extraReducers: (bapplder) => {
    bapplder
      .addCase(filesSlice.actions.createPlan, (state, { payload }) => {
        state.fileId = payload.plan.id
      })
      .addCase(filesSlice.actions.import, (state, { payload: { plans, entry } }) => {
        if (plans?.length === 0) return
        state.fileId = entry
      })
  },
})

export const openFirstPlan = (): AppThunk => (dispatch, getState) => {
  const state = getState()
  const planIds = plansSelectors.selectIds(state)

  if (planIds.length) {
    dispatch(appSlice.actions.openFile(planIds[planIds.length - 1] as string))
  } else {
    dispatch(filesSlice.actions.createPlan({}))
  }
}
