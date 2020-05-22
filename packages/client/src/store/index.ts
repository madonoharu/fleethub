import { combineReducers, configureStore } from "@reduxjs/toolkit"

import { plansSlice } from "./plansSlice"

const rootReducer = combineReducers({
  plans: plansSlice.reducer,
})

export const setupStore = () => {
  const store = configureStore({
    reducer: rootReducer,
  })
  return store
}

export * from "./plansSlice"

export type StoreState = ReturnType<typeof rootReducer>
export type AppDispatch = ReturnType<typeof setupStore>["dispatch"]
