import { AnyAction, combineReducers, configureStore } from "@reduxjs/toolkit";
import localforage from "localforage";
import { persistReducer, WebStorage } from "redux-persist";
import { ThunkAction } from "redux-thunk";
import undoable, { ActionTypes as UndoableActionTypes } from "redux-undo";

import { airSquadronsSlice } from "./airSquadronsSlice";
import { appSlice } from "./appSlice";
import { filesSlice } from "./filesSlice";
import { fleetsSlice } from "./fleetsSlice";
import { gearSelectSlice } from "./gearSelectSlice";
import { gearsSlice } from "./gearsSlice";
import { gkcoiSlice } from "./gkcoiSlice";
import { mapListSlice } from "./mapListSlice";
import { navSlice } from "./navSlice";
import { orgsSlice } from "./orgsSlice";
import { shipDetailsSlice } from "./shipDetailsSlice";
import { shipSelectSlice } from "./shipSelectSlice";
import { shipsSlice } from "./shipsSlice";
import undoableOptions from "./undoableOptions";

const noopStorage: WebStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

const storage = process.browser ? localforage : noopStorage;

const combinedReducer = combineReducers({
  app: appSlice.reducer,
  nav: navSlice.reducer,

  gears: gearsSlice.reducer,
  ships: shipsSlice.reducer,
  airSquadrons: airSquadronsSlice.reducer,
  fleets: fleetsSlice.reducer,
  orgs: orgsSlice.reducer,
  files: filesSlice.reducer,

  shipSelect: shipSelectSlice.reducer,
  gearSelect: gearSelectSlice.reducer,

  mapList: mapListSlice.reducer,
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
    timeout: 0,
    serialize: false,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    deserialize: false,
    blacklist: ["nav", "shipDetails"],
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
