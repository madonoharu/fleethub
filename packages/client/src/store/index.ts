import { combineReducers, configureStore, createReducer } from "@reduxjs/toolkit"

const plan = createReducer({}, {})

const rootReducer = combineReducers({
  plan,
})

export type StoreState = ReturnType<typeof rootReducer>

export const setupStore = () => {
  const store = configureStore({
    reducer: rootReducer,
  })
  return store
}

export type AppDispatch = ReturnType<typeof setupStore>["dispatch"]
