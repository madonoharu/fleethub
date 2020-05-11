import { combineReducers, configureStore } from "@reduxjs/toolkit"
import entitiesSlice from "./entities"
import shipSelectSlice from "./shipSelectSlice"

const rootReducer = combineReducers({
  entities: entitiesSlice.reducer,
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
export * from "./shipSelectSlice"
export { entitiesSlice, shipSelectSlice }

export type AppDispatch = ReturnType<typeof setupStore>["dispatch"]
