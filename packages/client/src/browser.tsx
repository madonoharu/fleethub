import React from "react"
import { Provider as ReduxProvider } from "react-redux"
import { GatsbyBrowser } from "gatsby"
import styled, { ThemeProvider as StyledThemeProvider } from "styled-components"
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles"
import CssBaseline from "@material-ui/core/CssBaseline"

import "./i18n"

import { setupStore } from "./store"
import theme from "./theme"
import { AppBar, GlobalDialogs } from "./components"

const ScrollContainer = styled.div`
  overflow-y: scroll;
  height: calc(100vh - 24px);
`

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({ element }) => {
  const store = setupStore()
  return (
    <ReduxProvider store={store}>
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar />
          <GlobalDialogs />
          <ScrollContainer>{element}</ScrollContainer>
        </MuiThemeProvider>
      </StyledThemeProvider>
    </ReduxProvider>
  )
}
