import { combineReducers, configureStore, createReducer } from "@reduxjs/toolkit"

import { plansSlice } from "./plansSlice"

const rootReducer = combineReducers({
  plans: plansSlice.reducer,
})

export { plansSlice }

export type StoreState = ReturnType<typeof rootReducer>

export const setupStore = () => {
  const store = configureStore({
    reducer: rootReducer,
  })
  return store
}

export type AppDispatch = ReturnType<typeof setupStore>["dispatch"]
