import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit"
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "localforage"
import undoable, { UndoableOptions, excludeAction } from "redux-undo"

import { makeGroupBy } from "../utils"

import { uiSlice } from "./uiSlice"
import { filesSlice } from "./filesSlice"
import { plansSlice } from "./plansSlice"

const ignoredActions = [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]

export const selectEntites = (state: RootState) => state.entities.present

const undoableOptions: UndoableOptions = {
  filter: excludeAction(ignoredActions),
  groupBy: makeGroupBy(),
  ignoreInitialState: true,
  limit: 10,
}

const entitiesReducer = combineReducers({
  files: filesSlice.reducer,
  plans: plansSlice.reducer,
})

const rootReducer = combineReducers({
  entities: undoable(persistReducer({ key: "entities", storage }, entitiesReducer), undoableOptions),
  ui: uiSlice.reducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions,
    },
  }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export * from "./plansSlice"
export * from "./filesSlice"
export * from "./uiSlice"
