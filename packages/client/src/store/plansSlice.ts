import { createSlice, createEntityAdapter, PayloadAction, nanoid, EntityId } from "@reduxjs/toolkit"
import { PlanState } from "@fleethub/core"
import { DefaultRootState } from "react-redux"

type PlanStateWithId = PlanState & { id: EntityId }

const plansAdapter = createEntityAdapter<PlanStateWithId>()
export const plansSelectors = plansAdapter.getSelectors((state: DefaultRootState) => state.plans)

export const plansSlice = createSlice({
  name: "plans",
  initialState: plansAdapter.getInitialState(),
  reducers: {
    set: (state, { payload }: PayloadAction<PlanStateWithId>) => {
      state.entities[payload.id] = payload
    },

    create: {
      reducer: (state, { payload }: PayloadAction<PlanStateWithId>) => {
        if (!payload.name) {
          payload.name = `編成${state.ids.length + 1}`
        }

        plansAdapter.addOne(state, payload)
      },
      prepare: (plan?: PlanState) => ({ payload: { ...plan, id: nanoid() } }),
    },

    update: plansAdapter.updateOne,
    remove: plansAdapter.removeOne,
  },
})
