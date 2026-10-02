import { combineReducers, configureStore, Reducer, UnknownAction } from "@reduxjs/toolkit";
import localforage from "localforage";
import { persistReducer, Storage, PersistConfig } from "redux-persist";
import autoMergeLevel1 from "redux-persist/lib/stateReconciler/autoMergeLevel1";
import { ThunkAction } from "redux-thunk";
import undoable, { ActionTypes as UndoableActionTypes } from "redux-undo";

import { appSlice, keepViewPreferences } from "./appSlice";
import { configSlice } from "./configSlice";
import { entitiesSlice } from "./entities";
import { reconcileLegacyActiveSteps } from "./entities/reconcileLegacyActiveSteps";
import { gearSelectSlice } from "./gearSelectSlice";
import { gkcoiSlice } from "./gkcoiSlice";
import { mapSelectSlice } from "./mapSelectSlice";
import { shipDetailsSlice } from "./shipDetailsSlice";
import { shipSelectSlice } from "./shipSelectSlice";
import undoableOptions from "./undoableOptions";

const noopStorage: Storage = {
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

  if ([UndoableActionTypes.UNDO, UndoableActionTypes.REDO].includes(args[1].type))
    return { ...next };
  return next;
};

type StateFromReducer<R> = R extends Reducer<infer S> ? S : never;
export type RootState = StateFromReducer<typeof combinedReducer>;

export const persistConfig: PersistConfig<RootState> = {
  key: "root",
  version: 1,
  storage,
  throttle: 50,
  timeout: 0,
  serialize: false,
  deserialize: false,
  whitelist: ["app", "config", "entities"],
  stateReconciler: (inbound, original, reduced, config) => {
    const state = autoMergeLevel1(inbound, original, reduced, config);
    const entities = reconcileLegacyActiveSteps(state.entities);
    return entities === state.entities ? state : { ...state, entities };
  },
};

const persistedReducer = persistReducer(persistConfig, persistedReducerBase);

const undoableReducer = undoable(persistedReducer, undoableOptions);

const HISTORY_JUMPS: string[] = [
  UndoableActionTypes.UNDO,
  UndoableActionTypes.REDO,
  UndoableActionTypes.JUMP,
  UndoableActionTypes.JUMP_TO_PAST,
  UndoableActionTypes.JUMP_TO_FUTURE,
];

const rootReducer: typeof undoableReducer = (state, action) => {
  const next = undoableReducer(state, action);

  if (!state || !HISTORY_JUMPS.includes(action.type)) return next;

  return {
    ...next,
    present: {
      ...next.present,
      app: keepViewPreferences(next.present.app, state.present.app),
    },
  };
};

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

type AppStore = ReturnType<typeof createStore>;
export type RootStateWithHistory = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk = ThunkAction<void, RootStateWithHistory, typeof extraArgument, UnknownAction>;
