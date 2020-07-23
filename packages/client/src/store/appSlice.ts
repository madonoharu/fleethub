import { createSlice, PayloadAction, AppThunk } from "@reduxjs/toolkit"

import { filesSlice } from "./filesSlice"
import { plansSelectors } from "./plansSlice"
import { ignoreUndoable } from "./undoableOptions"

type AppState = {
  fileId?: string
  explorerOpen: boolean
}

const initialState: AppState = {
  explorerOpen: true,
}

export const appSlice = createSlice({
  name: "app",
  initialState,

  reducers: {
    openFile: (state, { payload }: PayloadAction<string>) => {
      if (state.fileId !== payload) state.fileId = payload
    },
    closeFile: (state) => {
      delete state.fileId
    },
    toggleExplorerOpen: (state) => {
      state.explorerOpen = !state.explorerOpen
    },
  },

  extraReducers: (bapplder) => {
    bapplder
      .addCase(filesSlice.actions.createPlan, (state, { payload }) => {
        state.fileId = payload.plan.id
      })
      .addCase(filesSlice.actions.import, (state, { payload: { id, plans } }) => {
        if (plans?.length === 0) return
        state.fileId = id
      })
  },
})

export const openFirstPlan = (): AppThunk => (dispatch, getState) => {
  const state = getState()
  const planIds = plansSelectors.selectIds(state)

  ignoreUndoable(() => {
    if (planIds.length) {
      dispatch(appSlice.actions.openFile(planIds[planIds.length - 1] as string))
    } else {
      dispatch(filesSlice.actions.createPlan({ to: "root" }))
    }
  })
}
