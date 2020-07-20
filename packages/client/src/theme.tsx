import React from "react"

import { createMuiTheme, colors as muiColors, ThemeProvider as MuiThemeProvider, CssBaseline } from "@material-ui/core"
import createPalette from "@material-ui/core/styles/createPalette"
import { css, createGlobalStyle, ThemeProvider as StyledThemeProvider } from "styled-components"

const { blue, cyan, pink, grey, lightBlue } = muiColors

const fontFamily = `
-apple-system, 
BlinkMacSystemFont,
"Segoe UI",
Roboto,
"Hiragino Sans",
"Noto Sans CJK JP",
"Original Yu Gothic",
"Yu Gothic",
sans-serif,
"Apple Color Emoji",
"Segoe UI Emoji",
"Segoe UI Symbol",
"Noto Sans Emoji"
`

const muiPalette = createPalette({
  type: "dark",
  primary: blue,
  secondary: pink,
  background: {
    paper: "rgba(100, 100, 100, 0.1)",
  },
})

const muiTheme = createMuiTheme({
  typography: {
    fontFamily,
  },
  palette: muiPalette,
  props: {
    MuiContainer: {
      maxWidth: "md",
    },
    MuiDialog: {
      maxWidth: "md",
    },

    MuiLink: {
      target: "_blank",
      rel: "noopener",
    },
    MuiTooltip: {
      placement: "top",
    },
    MuiSnackbar: {
      autoHideDuration: 5000,
      anchorOrigin: { vertical: "top", horizontal: "right" },
    },
    MuiTabs: {
      indicatorColor: "primary",
    },
    MuiCheckbox: {
      color: "primary",
    },
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          overflowY: "hidden",
        },

        "@font-face": [
          {
            fontFamily: "Original Yu Gothic",
            src: "local('Yu Gothic Medium')",
            fontWeight: 100,
          },
          {
            fontFamily: "Original Yu Gothic",
            src: "local('Yu Gothic Medium')",
            fontWeight: 200,
          },
          {
            fontFamily: "Original Yu Gothic",
            src: "local('Yu Gothic Medium')",
            fontWeight: 300,
          },
          {
            fontFamily: "Original Yu Gothic",
            src: "local('Yu Gothic Medium')",
            fontWeight: 400,
          },
          {
            fontFamily: "Original Yu Gothic",
            src: "local('Yu Gothic Bold')",
            fontWeight: "bold",
          },
        ],
      },
    },
    MuiButton: {
      root: {
        textTransform: "none",
        minWidth: 0,
        fontWeight: 400,
      },
    },
    MuiListItemIcon: {
      root: {
        minWidth: "auto",
        marginRight: 16,
      },
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: "rgba(30, 30, 35)",
      },
    },
    MuiDrawer: {
      paper: {
        backgroundColor: "rgba(30, 30, 35)",
      },
    },
  },
})

const kcPalette = {
  firepower: muiColors.pink[300],
  torpedo: muiColors.blue[300],
  antiAir: muiColors.green[300],
  asw: muiColors.cyan[300],
  bombing: muiColors.pink[300],
  accuracy: muiColors.deepOrange[200],
  evasion: muiColors.lightBlue[300],
  antiBomber: muiColors.deepOrange[200],
  interception: muiColors.lightBlue[300],
  los: muiColors.lime[300],
  armor: muiColors.amber[300],
  range: muiColors.purple[200],
  radius: muiColors.lightGreen[300],

  maxHp: muiPalette.text.primary,
  speed: muiPalette.text.primary,
  luck: muiColors.yellow[300],

  stars: cyan[400],
  bonus: lightBlue[300],
  increase: muiPalette.secondary.light,

  shelling: muiColors.orange[500],
  night: muiColors.indigo[200],

  airState: {
    AirSupremacy: muiColors.green[300],
    AirSuperiority: muiColors.blue[300],
    AirParity: muiColors.orange[300],
    AirDenial: muiColors.pink[300],
    AirIncapability: muiColors.red[300],
  },
}

const kc = {
  palette: kcPalette,
}

const gradientAnimation = css`
  background-size: 400% 400%;
  animation: gradient 120s ease infinite;

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`
const isFirefox = window.navigator.userAgent.includes("Firefox")

const acrylic = isFirefox
  ? css`
      background: rgba(60, 60, 70, 0.95);
    `
  : css`
      background: rgba(60, 60, 70, 0.6);
      backdrop-filter: blur(8px);
    `

const darkAcrylic = isFirefox
  ? css`
      background: rgba(30, 30, 35, 0.98);
    `
  : css`
      background: rgba(30, 30, 35, 0.85);
      backdrop-filter: blur(8px);
    `

const colors = {
  droppable: muiColors.yellow[300],
}

const swappable = css`
  border-radius: 4px;

  &.droppable {
    box-shadow: 0px 0px 2px 2px ${colors.droppable};
  }

  &.dragging {
    opacity: 0.3;
  }
`

const theme = { ...muiTheme, kc, acrylic, swappable, colors }

export type Theme = typeof theme

const scrollbarColor = grey[700]

const GlobalStyle = createGlobalStyle(
  ({ theme }) => css`
    body {
      background: linear-gradient(-45deg, #141e30, #243b55);
    }

    * {
      scrollbar-color: ${scrollbarColor} transparent;
      scrollbar-width: thin;
    }
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-thumb {
      background: ${scrollbarColor};
    }
    ::-webkit-scrollbar-track,
    ::-webkit-scrollbar-corner {
      background: transparent;
    }

    .MuiPopover-paper,
    .MuiDialog-paper {
      ${theme.acrylic}
    }

    .MuiTooltip-popper {
      will-change: auto !important;
    }
    .MuiTooltip-tooltip {
      font-size: ${theme.typography.body2.fontSize};
      ${darkAcrylic}
    }
  `
)

export const ThemeProvider: React.FC = ({ children }) => (
  <MuiThemeProvider theme={theme}>
    <StyledThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyle />
      {children}
    </StyledThemeProvider>
  </MuiThemeProvider>
)
