import { combineReducers, configureStore, CombinedState, Reducer } from "@reduxjs/toolkit"
import { persistReducer, persistStore, PersistState } from "redux-persist"
import storage from "localforage"

import { plansSlice } from "./plansSlice"
import { planEditorSlice } from "./planEditorSlice"

const rootReducer = combineReducers({
  plans: plansSlice.reducer,
  planEditor: planEditorSlice.reducer,
})

export type RootState = ReturnType<typeof rootReducer>

const persistConfig = {
  key: "root",
  storage,
}

const persistedReducer: Reducer<RootState & PersistState> = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
})

export const persistor = persistStore(store)

export * from "./plansSlice"
export * from "./planEditorSlice"

export type AppDispatch = typeof store.dispatch
