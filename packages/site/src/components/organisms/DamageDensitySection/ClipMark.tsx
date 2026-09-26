import React from "react";

import { AXIS_FONT_SIZE } from "./chartLabels";

interface Props {
  /** プロット領域の左端。目盛の数字はこの左に並ぶ。 */
  x: number;
  /** 軸の最上部。 */
  y: number;
  text: string;
  color: string;
}

/** 目盛の線と数字の間隔。recharts の既定（tickSize 6 + tickMargin 2）に合わせる。 */
const TICK_OFFSET = 8;

/**
 * 上段に逃がした棒の実値。
 *
 * 棒の幅は点の数で決まり、数百点あると 1〜4px しかない。値を棒の上に載せても
 * どの棒のものか読めないので、上段の目盛に混ぜて棒の頭の高さに置く。
 * 棒と同じ色にして「軸の目盛ではなくこの棒の値」と分かるようにする。
 */
const ClipMark: React.FC<Props> = ({ x, y, text, color }) => (
  <text
    x={x - TICK_OFFSET}
    y={y}
    fill={color}
    fontSize={AXIS_FONT_SIZE}
    textAnchor="end"
    dominantBaseline="central"
  >
    {text}
  </text>
);

export default ClipMark;
