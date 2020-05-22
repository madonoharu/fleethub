import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { PlanState } from "@fleethub/core"

const plansAdapter = createEntityAdapter<PlanState>()

export const plansSlice = createSlice({
  name: "plans",
  initialState: plansAdapter.getInitialState(),
  reducers: {
    upsert: plansAdapter.upsertOne,
    remove: plansAdapter.removeOne,
  },
})
