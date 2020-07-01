import React from "react"
import { combineReducers, configureStore, getDefaultMiddleware, AnyAction } from "@reduxjs/toolkit"
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "localforage"
import undoable, { UndoableOptions } from "redux-undo"
import { ThunkAction } from "redux-thunk"

import { Provider as ReduxProvider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"

import { makeGroupBy } from "../utils"

import { appSlice } from "./appSlice"
import { entitiesReducer } from "./entities"
import { removeFile } from "./filesSlice"
import { mapListSlice } from "./mapListSlice"
import { shipListSlice } from "./shipListSlice"
import { gearListSlice } from "./gearListSlice"

const ignoredActions = [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]

const undoableOptions: UndoableOptions = {
  filter: (action, currentState, previousHistory) => {
    return ["entities", appSlice.name].some((key) => (action.type as string).startsWith(key))
  },
  groupBy: makeGroupBy(),
  ignoreInitialState: true,
  limit: 10,
}

const rootReducer = undoable(
  combineReducers({
    entities: persistReducer({ key: "entities", storage }, entitiesReducer),
    app: appSlice.reducer,

    mapList: mapListSlice.reducer,
    gearList: gearListSlice.reducer,
    shipList: shipListSlice.reducer,
  }),
  undoableOptions
)

const extraArgument = undefined

export const createStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware({
      thunk: {
        extraArgument,
      },
      serializableCheck: {
        ignoredActions,
      },
    }),
  })

  window.addEventListener("beforeunload", () => {
    store.dispatch(removeFile("temp"))
  })

  return store
}

export const StoreProvider: React.FC = ({ children }) => {
  const store = createStore()
  const persistor = persistStore(store)

  return (
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor}>{children}</PersistGate>
    </ReduxProvider>
  )
}

type Store = ReturnType<typeof createStore>
export type RootState = ReturnType<Store["getState"]>
export type AppDispatch = Store["dispatch"]
export type AppThunk = ThunkAction<void, RootState, typeof extraArgument, AnyAction>

export * from "./appSlice"
export * from "./plansSlice"
export * from "./filesSlice"
export * from "./entities"
export * from "./mapListSlice"
export * from "./shipListSlice"
export * from "./gearListSlice"

export * from "./selectors"
