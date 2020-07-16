import { combineReducers, configureStore, getDefaultMiddleware, AnyAction, Action, Reducer } from "@reduxjs/toolkit"
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "localforage"
import undoable, { UndoableOptions, ActionTypes as UndoableActionTypes } from "redux-undo"
import { ThunkAction } from "redux-thunk"

import { makeGroupBy } from "../utils"

import { appSlice } from "./appSlice"
import { entitiesReducer } from "./entities"
import { mapListSlice } from "./mapListSlice"
import { shipListSlice } from "./shipListSlice"
import { gearListSlice } from "./gearListSlice"

const ignoredActions = [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]

const undoableOptions: UndoableOptions = {
  filter: (action) => ["entities", appSlice.name].some((key) => (action.type as string).startsWith(key)),
  groupBy: makeGroupBy(),
  limit: 10,
  neverSkipReducer: true,
}

const combinedReducer = combineReducers({
  entities: entitiesReducer,
  app: appSlice.reducer,

  mapList: mapListSlice.reducer,
  gearList: gearListSlice.reducer,
  shipList: shipListSlice.reducer,
})

const persistedReducerBase: typeof combinedReducer = (...args) => {
  const next = combinedReducer(...args)
  if ([UndoableActionTypes.UNDO, UndoableActionTypes.REDO].includes(args[1].type)) return { ...next }
  return next
}

const persistedReducer = persistReducer({ key: "root", storage }, persistedReducerBase)

const rootReducer = undoable(persistedReducer, undoableOptions)

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
