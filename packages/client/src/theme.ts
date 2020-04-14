import { blue, cyan, pink, grey, lightBlue } from "@material-ui/core/colors"
import { createMuiTheme } from "@material-ui/core"
import createPalette from "@material-ui/core/styles/createPalette"

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

const dark = "rgba(15, 20, 20, 0.9)"
const clear = "rgba(20, 20, 20, 0.1)"
const blueGrey = "rgba(66, 66, 77, 0.95)"

const palette = createPalette({
  type: "dark",
  primary: blue,
  secondary: pink,
  background: {
    default: blueGrey,
    paper: blueGrey,
  },
})

const muiTheme = createMuiTheme({
  typography: {
    fontFamily,
  },
  palette,
  props: {
    MuiContainer: {
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
      },
    },
    MuiTooltip: {
      tooltip: {
        backgroundColor: dark,
      },
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: palette.grey[800],
      },
    },
  },
})

const kc = {
  stars: cyan[400],
  bonus: lightBlue[400],
}
const theme = { ...muiTheme, kc }
export type Theme = typeof theme

export default theme
