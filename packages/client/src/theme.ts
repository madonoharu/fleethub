import { blue, cyan, pink, grey } from "@material-ui/core/colors"
import { createMuiTheme } from "@material-ui/core"
import createPalette from "@material-ui/core/styles/createPalette"

const fontFamily = `
-apple-system, 
BlinkMacSystemFont,
"Segoe UI Regular",
"Segoe UI",
Roboto,
"Hiragino Sans",
"Noto Sans CJK JP",
"Yu Gothic",
sans-serif,
"Apple Color Emoji",
"Segoe UI Emoji",
"Segoe UI Symbol",
"Noto Sans Emoji"
`

const clear = "rgba(20, 20, 20, 0.1)"

const palette = createPalette({
  type: "dark",
  primary: blue,
  secondary: pink,
})

const muiTheme = createMuiTheme({
  typography: {
    fontFamily,
  },
  palette,
  props: {
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
      },
    },
    MuiButton: {
      root: {
        textTransform: "none",
        minWidth: 0,
      },
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: palette.grey[800],
      },
    },
  },
})

const kc = { stars: cyan[500] }
const theme = { ...muiTheme, kc }
export type Theme = typeof theme

export default theme
