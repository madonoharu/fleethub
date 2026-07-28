import type { StaticImageData } from "next/image";

import ace0 from "./ace0.png";
import ace1 from "./ace1.png";
import ace2 from "./ace2.png";
import ace3 from "./ace3.png";
import ace4 from "./ace4.png";
import ace5 from "./ace5.png";
import ace6 from "./ace6.png";
import ace7 from "./ace7.png";

// expToAce の値域 0..7 と対応する固定長タプル
export const ACE_ICONS: readonly [
  StaticImageData,
  StaticImageData,
  StaticImageData,
  StaticImageData,
  StaticImageData,
  StaticImageData,
  StaticImageData,
  StaticImageData,
] = [ace0, ace1, ace2, ace3, ace4, ace5, ace6, ace7];
