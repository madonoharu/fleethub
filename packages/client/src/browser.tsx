import React from "react"
import { Provider as ReduxProvider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { GatsbyBrowser } from "gatsby"
import styled, { ThemeProvider as StyledThemeProvider } from "styled-components"
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles"
import CssBaseline from "@material-ui/core/CssBaseline"

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
        <StyledThemeProvider theme={theme}>
          <MuiThemeProvider theme={theme}>
            <GlobalDialogsProvider>
              <CssBaseline />
              <AppBar />
              <ScrollContainer>{element}</ScrollContainer>
            </GlobalDialogsProvider>
          </MuiThemeProvider>
        </StyledThemeProvider>
      </PersistGate>
    </ReduxProvider>
  )
}
