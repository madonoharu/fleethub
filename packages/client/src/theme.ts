import blue from "@material-ui/core/colors/blue"
import cyan from "@material-ui/core/colors/cyan"
import pink from "@material-ui/core/colors/pink"
import { createMuiTheme } from "@material-ui/core/styles"

const muiTheme = createMuiTheme({
  palette: {
    type: "dark",
    primary: blue,
    secondary: pink,
  },
  props: {
    MuiLink: {
      target: "_blank",
      rel: "noopener",
    },
  },
  overrides: {
    MuiButton: {
      root: {
        textTransform: "none",
      },
    },
  },
})

const kc = { stars: cyan[500] }
const theme = { ...muiTheme, kc }
export type Theme = typeof theme

export default theme
