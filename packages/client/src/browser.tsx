import React from "react"
import { Provider } from "react-redux"
import { GatsbyBrowser } from "gatsby"
import { ThemeProvider as StyledThemeProvider } from "styled-components"
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles"
import CssBaseline from "@material-ui/core/CssBaseline"

import { setupStore } from "./store"
import theme from "./theme"
import { AppBar } from "./components"

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({ element }) => {
  const store = setupStore()
  return (
    <Provider store={store}>
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar />
          {element}
        </MuiThemeProvider>
      </StyledThemeProvider>
    </Provider>
  )
}
