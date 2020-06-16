import { createMuiTheme, colors } from "@material-ui/core"
import createPalette from "@material-ui/core/styles/createPalette"
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

const backgroundColor = colors.grey[800]
const clear = "rgba(20, 20, 20, 0.1)"
const blueGrey = "rgba(66, 66, 77, 0.95)"

const muiPalette = createPalette({
  type: "dark",
  primary: blue,
  secondary: pink,
  background: {
    default: backgroundColor,
    paper: backgroundColor,
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
    MuiTooltip: {
      tooltip: {
        backgroundColor,
      },
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: muiPalette.grey[800],
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
const theme = { ...muiTheme, kc }
export type Theme = typeof theme

export default theme
