import { colors as muiColors, createTheme } from "@mui/material";

const { blue, cyan, pink, grey, lightBlue, green } = muiColors;

export const { palette } = createTheme({
  palette: {
    mode: "dark",
    primary: blue,
    secondary: {
      main: pink[400],
    },
    success: green,
    background: {
      paper: "rgba(100, 100, 100, 0.1)",
    },
  },
});

const stats = {
  firepower: muiColors.pink[300],
  torpedo: muiColors.blue[300],
  anti_air: muiColors.green[300],
  asw: muiColors.cyan[300],
  bombing: muiColors.pink[300],
  accuracy: muiColors.deepOrange[200],
  evasion: muiColors.lightBlue[300],
  anti_bomber: muiColors.deepOrange[200],
  interception: muiColors.lightBlue[300],
  los: muiColors.lime[300],
  armor: muiColors.amber[300],
  range: muiColors.purple[200],
  radius: muiColors.lightGreen[300],
  max_hp: palette.text.primary,
  speed: palette.text.primary,
  luck: muiColors.yellow[300],
};

export const colors = {
  ...stats,

  stars: cyan[400],
  bonus: lightBlue[300],
  diff: palette.secondary.light,

  AirSupremacy: muiColors.green[300],
  AirSuperiority: muiColors.blue[300],
  AirParity: muiColors.orange[300],
  AirDenial: muiColors.pink[300],
  AirIncapability: muiColors.red[300],

  DamageNormal: muiColors.green[500],
  DamageShouha: muiColors.yellow[500],
  DamageChuuha: muiColors.orange[500],
  DamageTaiha: muiColors.red[500],
  DamageSunk: muiColors.blue[500],

  Sparkle: muiColors.yellow[500],
  Normal: muiColors.blue[500],
  Orange: muiColors.orange[500],
  Red: muiColors.red[500],

  scrollbar: grey[700],
  droppable: muiColors.yellow[300],

  planFile: muiColors.blue[400],
  folder: muiColors.green[300],

  Shelling: muiColors.orange[400],
  NightAttack: muiColors.indigo[200],
  Asw: stats.asw,
  Torpedo: stats.torpedo,
};
