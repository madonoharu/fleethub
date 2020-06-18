import React from "react"

import { Provider as ReduxProvider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"

import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import { GatsbyBrowser } from "gatsby"

import "./i18n"

import { store, persistor } from "./store"
import { ThemeProvider } from "./theme"
import { GlobalDialogsProvider } from "./components"

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({ element }) => {
  return (
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor}>
        <DndProvider backend={HTML5Backend}>
          <ThemeProvider>
            <GlobalDialogsProvider>{element}</GlobalDialogsProvider>
          </ThemeProvider>
        </DndProvider>
      </PersistGate>
    </ReduxProvider>
  )
}
