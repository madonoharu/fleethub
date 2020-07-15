import { combineReducers, configureStore, getDefaultMiddleware, AnyAction } from "@reduxjs/toolkit"
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "localforage"
import undoable, { UndoableOptions } from "redux-undo"
import { ThunkAction } from "redux-thunk"

import { makeGroupBy } from "../utils"

import { appSlice } from "./appSlice"
import { entitiesReducer } from "./entities"
import { mapListSlice } from "./mapListSlice"
import { shipListSlice } from "./shipListSlice"
import { gearListSlice } from "./gearListSlice"

const ignoredActions = [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]

const undoableOptions: UndoableOptions = {
  filter: (action) => {
    return ["entities", appSlice.name].some((key) => (action.type as string).startsWith(key))
  },
  groupBy: makeGroupBy(),
  ignoreInitialState: true,
  limit: 10,
}

const rootReducer = undoable(
  combineReducers({
    entities: persistReducer({ key: "entities", storage }, entitiesReducer),
    app: persistReducer({ key: "app", storage }, appSlice.reducer),

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

  return store
}

type Store = ReturnType<typeof createStore>
export type RootState = ReturnType<Store["getState"]>
export type AppDispatch = Store["dispatch"]
export type AppThunk = ThunkAction<void, RootState, typeof extraArgument, AnyAction>
