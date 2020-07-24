import { combineReducers, configureStore, getDefaultMiddleware, AnyAction } from "@reduxjs/toolkit"
import { persistReducer } from "redux-persist"
import storage from "localforage"
import undoable, { ActionTypes as UndoableActionTypes } from "redux-undo"
import { ThunkAction } from "redux-thunk"

import { appSlice } from "./appSlice"
import { entitiesReducer } from "./entities"
import { mapListSlice } from "./mapListSlice"
import { shipListSlice } from "./shipListSlice"
import { gearListSlice } from "./gearListSlice"
import { gkcoiSlice } from "./gkcoiSlice"

import undoableOptions from "./undoableOptions"

const combinedReducer = combineReducers({
  entities: entitiesReducer,
  app: appSlice.reducer,
  mapList: mapListSlice.reducer,
  gearList: gearListSlice.reducer,
  shipList: shipListSlice.reducer,
  gkcoi: gkcoiSlice.reducer,
})

const persistedReducerBase: typeof combinedReducer = (...args) => {
  const next = combinedReducer(...args)
  if ([UndoableActionTypes.UNDO, UndoableActionTypes.REDO].includes(args[1].type)) return { ...next }
  return next
}

const persistedReducer = persistReducer(
  { key: "root", version: 1, storage, throttle: 50, timeout: 0 },
  persistedReducerBase
)

const rootReducer = undoable(persistedReducer, undoableOptions)

const extraArgument = undefined

export const createStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware({
      thunk: { extraArgument },
      immutableCheck: false,
      serializableCheck: false,
    }),
  })

  return store
}

export type AppStore = ReturnType<typeof createStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
export type AppThunk = ThunkAction<void, RootState, typeof extraArgument, AnyAction>
