import { colors as muiColors } from "@material-ui/core"
import { createMuiTheme } from "@material-ui/core"

const { blue, cyan, pink, grey, lightBlue } = muiColors

export const { palette } = createMuiTheme({
  palette: {
    mode: "dark",
    primary: blue,
    secondary: pink,
    background: {
      paper: "rgba(100, 100, 100, 0.1)",
    },
  },
})

export const colors = {
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

  maxHp: palette.text.primary,
  speed: palette.text.primary,
  luck: muiColors.yellow[300],

  stars: cyan[400],
  bonus: lightBlue[300],
  increase: palette.secondary.light,

  shelling: muiColors.orange[500],
  night: muiColors.indigo[200],

  AirSupremacy: muiColors.green[300],
  AirSuperiority: muiColors.blue[300],
  AirParity: muiColors.orange[300],
  AirDenial: muiColors.pink[300],
  AirIncapability: muiColors.red[300],

  scrollbar: grey[700],
  droppable: muiColors.yellow[300],

  planFile: muiColors.blue[400],
  folder: muiColors.green[300],
}
