import { combineReducers, configureStore } from "@reduxjs/toolkit"

import { plansSlice } from "./plansSlice"
import { planEditorSlice } from "./planEditorSlice"

const rootReducer = combineReducers({
  plans: plansSlice.reducer,
  planEditor: planEditorSlice.reducer,
})

export const setupStore = () => {
  const store = configureStore({
    reducer: rootReducer,
  })
  return store
}

export * from "./plansSlice"
export * from "./planEditorSlice"

export type StoreState = ReturnType<typeof rootReducer>
export type AppDispatch = ReturnType<typeof setupStore>["dispatch"]
