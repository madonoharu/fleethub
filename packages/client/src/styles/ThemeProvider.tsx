import React from "react"

import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@material-ui/core"
import { css, createGlobalStyle, ThemeProvider as StyledThemeProvider } from "styled-components"
import theme from "./theme"

const GlobalStyle = createGlobalStyle(
  ({ theme }) => css`
    body {
      background: linear-gradient(-45deg, #141e30, #243b55);
    }

    * {
      scrollbar-color: ${theme.colors.scrollbar} transparent;
      scrollbar-width: thin;
    }
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-thumb {
      background: ${theme.colors.scrollbar};
    }
    ::-webkit-scrollbar-track,
    ::-webkit-scrollbar-corner {
      background: transparent;
    }

    .MuiPopover-paper,
    .MuiDialog-paper {
      ${theme.styles.acrylic}
    }

    .MuiTooltip-popper {
      will-change: auto !important;
    }
    .MuiTooltip-tooltip {
      font-size: ${theme.typography.body2.fontSize};
      ${theme.styles.darkAcrylic}
    }
  `
)

const ThemeProvider: React.FC = ({ children }) => (
  <MuiThemeProvider theme={theme}>
    <StyledThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyle />
      {children}
    </StyledThemeProvider>
  </MuiThemeProvider>
)

export default ThemeProvider
