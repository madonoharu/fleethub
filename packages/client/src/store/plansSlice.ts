import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { PlanState } from "@fleethub/core"
import { DefaultRootState } from "react-redux"

const plansAdapter = createEntityAdapter<PlanState>()
export const plansSelectors = plansAdapter.getSelectors((state: DefaultRootState) => state.plans)

export const plansSlice = createSlice({
  name: "plans",
  initialState: plansAdapter.getInitialState(),
  reducers: {
    upsert: plansAdapter.upsertOne,
    remove: plansAdapter.removeOne,
  },
})
