import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit"
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "localforage"
import undoable from "redux-undo"

import { filesSlice } from "./filesSlice"
import { plansSlice } from "./plansSlice"
import { uiSlice } from "./uiSlice"

const rootReducer = combineReducers({
  files: filesSlice.reducer,
  plans: persistReducer({ key: plansSlice.name, storage }, plansSlice.reducer),
  ui: uiSlice.reducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export * from "./plansSlice"
export * from "./filesSlice"
export * from "./uiSlice"
