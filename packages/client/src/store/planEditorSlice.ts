import { createSlice, PayloadAction, EntityId } from "@reduxjs/toolkit"

type PlanEditorState = {
  planId?: EntityId
}

const initialState: PlanEditorState = {}

export const planEditorSlice = createSlice({
  name: "planEditor",
  initialState,
  reducers: {
    update: (state, { payload }: PayloadAction<Partial<PlanEditorState>>) => {
      Object.assign(state, payload)
    },
  },
})
