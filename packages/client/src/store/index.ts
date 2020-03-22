import { combineReducers, configureStore } from "@reduxjs/toolkit"
import entitiesSlice from "./entities"
import gearSelectSlice from "./gearSelectSlice"
import shipSelectSlice from "./shipSelectSlice"

const rootReducer = combineReducers({
  entities: entitiesSlice.reducer,
  gearSelect: gearSelectSlice.reducer,
  shipSelect: shipSelectSlice.reducer,
})

export type StoreState = ReturnType<typeof rootReducer>

export const setupStore = () => {
  const store = configureStore({
    reducer: rootReducer,
  })
  return store
}

export * from "./entities"
export * from "./gearSelectSlice"
export * from "./shipSelectSlice"
export { entitiesSlice, gearSelectSlice, shipSelectSlice }

export type AppDispatch = ReturnType<typeof setupStore>["dispatch"]
