import { combineReducers, configureStore } from "@reduxjs/toolkit"
import entitiesSlice from "./entities"

const rootReducer = combineReducers({
  entities: entitiesSlice.reducer,
})

export type StoreState = ReturnType<typeof rootReducer>

export const setupStore = () => {
  const store = configureStore({
    reducer: rootReducer,
  })
  return store
}

export * from "./entities"
export { entitiesSlice }

export type AppDispatch = ReturnType<typeof setupStore>["dispatch"]
