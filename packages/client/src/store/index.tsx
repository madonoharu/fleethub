import React from "react"
import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit"
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "localforage"
import undoable, { UndoableOptions, excludeAction } from "redux-undo"

import { Provider as ReduxProvider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { firebaseReducer, ReactReduxFirebaseProvider, ReactReduxFirebaseProviderProps } from "react-redux-firebase"
import { firestoreReducer, createFirestoreInstance } from "redux-firestore"

import { makeGroupBy } from "../utils"

import { uiSlice } from "./uiSlice"
import { filesSlice } from "./filesSlice"
import { plansSlice } from "./plansSlice"
import { firebase } from "./firebase"

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
  firebase: firebaseReducer,
  firestore: firestoreReducer,
})

export const createStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware({
      serializableCheck: {
        ignoredActions,
      },
    }),
  })

  return store
}

export const StoreProvider: React.FC = ({ children }) => {
  const store = createStore()
  const persistor = persistStore(store)

  const rffProps: ReactReduxFirebaseProviderProps = {
    firebase,
    dispatch: store.dispatch,
    config: {
      userProfile: "user",
    },
    createFirestoreInstance,
  }

  return (
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor}>
        <ReactReduxFirebaseProvider {...rffProps}>{children}</ReactReduxFirebaseProvider>
      </PersistGate>
    </ReduxProvider>
  )
}

type Store = ReturnType<typeof createStore>
export type RootState = ReturnType<Store["getState"]>
export type AppDispatch = Store["dispatch"]

export * from "./plansSlice"
export * from "./filesSlice"
export * from "./uiSlice"
