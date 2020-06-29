import React from "react"

import { createMuiTheme, colors, ThemeProvider as MuiThemeProvider, CssBaseline } from "@material-ui/core"
import createPalette from "@material-ui/core/styles/createPalette"
import { css, createGlobalStyle, ThemeProvider as StyledThemeProvider } from "styled-components"
import { AirState } from "@fleethub/core"

const { blue, cyan, pink, grey, lightBlue } = colors

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
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          overflowY: "hidden",
        },

        "*": {
          scrollbarColor: `${grey[700]} transparent`,
          scrollbarWidth: "thin",
        },

        "::-webkit-scrollbar": {
          width: 8,
        },
        "::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "::-webkit-scrollbar-thumb": {
          background: grey[700],
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
  },
})

const kcPalette = {
  firepower: colors.pink[300],
  torpedo: colors.blue[300],
  antiAir: colors.green[300],
  asw: colors.cyan[300],
  bombing: colors.pink[300],
  accuracy: colors.deepOrange[200],
  evasion: colors.lightBlue[300],
  antiBomber: colors.deepOrange[200],
  interception: colors.lightBlue[300],
  los: colors.lime[300],
  armor: colors.amber[300],
  range: colors.purple[200],
  radius: colors.lightGreen[300],

  maxHp: muiPalette.text.primary,
  speed: muiPalette.text.primary,
  luck: colors.yellow[300],

  stars: cyan[400],
  bonus: lightBlue[300],
  increase: muiPalette.secondary.light,

  airState: {
    [AirState.AirSupremacy]: colors.green[300],
    [AirState.AirSuperiority]: colors.blue[300],
    [AirState.AirParity]: colors.orange[300],
    [AirState.AirDenial]: colors.pink[300],
    [AirState.AirIncapability]: colors.red[300],
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
      background: rgba(60, 60, 70, 0.7);
      backdrop-filter: blur(8px);
    `

const theme = { ...muiTheme, kc, acrylic }

export type Theme = typeof theme

const globalCss = css`
  body {
    background: linear-gradient(-45deg, #141e30, #243b55);
  }

  .MuiPopover-paper {
    ${(props) => props.theme.acrylic}
  }

  .MuiTooltip-popper {
    will-change: auto !important;
  }
  .MuiTooltip-tooltip {
    ${(props) => props.theme.acrylic}
  }
`

const GlobalStyle = createGlobalStyle(() => globalCss)

export const ThemeProvider: React.FC = ({ children }) => (
  <MuiThemeProvider theme={theme}>
    <StyledThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyle />
      {children}
    </StyledThemeProvider>
  </MuiThemeProvider>
)
