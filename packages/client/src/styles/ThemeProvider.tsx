import React from "react"

import { MuiThemeProvider, CssBaseline } from "@material-ui/core"
import { Global, css } from "@emotion/core"

import theme, { Theme } from "./theme"

const globalStyles = (theme: Theme) => css`
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

const ThemeProvider: React.FC = ({ children }) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <Global styles={globalStyles} />
    {children}
  </MuiThemeProvider>
)

export default ThemeProvider
