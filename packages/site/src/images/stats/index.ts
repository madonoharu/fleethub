import accuracy from "./accuracy.png";
import anti_air from "./anti_air.png";
import anti_bomber from "./anti_bomber.png";
import armor from "./armor.png";
import asw from "./asw.png";
import bombing from "./bombing.png";
import evasion from "./evasion.png";
import firepower from "./firepower.png";
import interception from "./interception.png";
import los from "./los.png";
import luck from "./luck.png";
import max_hp from "./max_hp.png";
import radius from "./radius.png";
import range from "./range.png";
import speed from "./speed.png";
import torpedo from "./torpedo.png";
import torpedo_accuracy from "./torpedo_accuracy.png";

export const STAT_ICONS = {
  accuracy,
  anti_air,
  anti_bomber,
  armor,
  asw,
  bombing,
  evasion,
  firepower,
  interception,
  los,
  luck,
  max_hp,
  radius,
  range,
  speed,
  torpedo,
  torpedo_accuracy,
};

export type StatIconKey = keyof typeof STAT_ICONS;
