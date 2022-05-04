import { AnyAction, combineReducers, configureStore } from "@reduxjs/toolkit";
import localforage from "localforage";
import { persistReducer, WebStorage } from "redux-persist";
import { ThunkAction } from "redux-thunk";
import undoable, { ActionTypes as UndoableActionTypes } from "redux-undo";

import { appSlice } from "./appSlice";
import { configSlice } from "./configSlice";
import { entitiesSlice } from "./entities";
import { gearSelectSlice } from "./gearSelectSlice";
import { gkcoiSlice } from "./gkcoiSlice";
import { mapSelectSlice } from "./mapSelectSlice";
import { shipDetailsSlice } from "./shipDetailsSlice";
import { shipSelectSlice } from "./shipSelectSlice";
import undoableOptions from "./undoableOptions";

const noopStorage: WebStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

const storage = typeof window !== "undefined" ? localforage : noopStorage;

const combinedReducer = combineReducers({
  app: appSlice.reducer,
  config: configSlice.reducer,
  entities: entitiesSlice.reducer,

  shipSelect: shipSelectSlice.reducer,
  gearSelect: gearSelectSlice.reducer,
  mapSelect: mapSelectSlice.reducer,

  gkcoi: gkcoiSlice.reducer,
  shipDetails: shipDetailsSlice.reducer,
});

const persistedReducerBase: typeof combinedReducer = (...args) => {
  const next = combinedReducer(...args);

  if (
    [UndoableActionTypes.UNDO, UndoableActionTypes.REDO].includes(
      args[1].type as string
    )
  )
    return { ...next };
  return next;
};

const persistedReducer = persistReducer(
  {
    key: "root",
    version: 1,
    storage,
    throttle: 50,
    timeout: 1000,
    serialize: false,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    deserialize: false,
    whitelist: ["app", "entities"],
  },
  persistedReducerBase
);

const rootReducer = undoable(persistedReducer, undoableOptions);

const extraArgument = undefined;

export const createStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument },
        immutableCheck: false,
        serializableCheck: false,
      }),
  });

  return store;
};

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk = ThunkAction<
  void,
  RootState,
  typeof extraArgument,
  AnyAction
>;
