import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit"
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
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

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
})

export const persistor = persistStore(store)

export * from "./plansSlice"
export * from "./planEditorSlice"

export type AppDispatch = typeof store.dispatch
