import React from "react"

import { Provider as ReduxProvider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"

import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import styled, { ThemeProvider as StyledThemeProvider } from "styled-components"
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles"
import CssBaseline from "@material-ui/core/CssBaseline"

import { GatsbyBrowser } from "gatsby"

import "./i18n"

import { store, persistor } from "./store"
import theme from "./theme"
import { AppBar, GlobalDialogsProvider } from "./components"

const ScrollContainer = styled.div`
  overflow-y: scroll;
  height: calc(100vh - 24px);
`

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({ element }) => {
  return (
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor}>
        <DndProvider backend={HTML5Backend}>
          <StyledThemeProvider theme={theme}>
            <MuiThemeProvider theme={theme}>
              <GlobalDialogsProvider>
                <CssBaseline />
                <AppBar />
                <ScrollContainer>{element}</ScrollContainer>
              </GlobalDialogsProvider>
            </MuiThemeProvider>
          </StyledThemeProvider>
        </DndProvider>
      </PersistGate>
    </ReduxProvider>
  )
}
