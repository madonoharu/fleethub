import React from "react";

import type { LabelViewBox } from "./chartLabels";
import { LABEL_FONT_SIZE, estimateTextWidth } from "./chartLabels";

interface Props {
  /** 帯の左端と幅。 */
  box: LabelViewBox;
  /** プロット領域の上端。罫はこの線の上に重ねる。 */
  y: number;
  text: string;
  color: string;
}

/**
 * 損傷状態の帯の見出し。
 *
 * 帯の範囲ぶんの罫をプロットの上端の境界に重ね、名前をその上（図の外）に置く。
 * 背景の塗りは薄いので、境界がどこかはこの罫で読ませる。
 */
const ZoneLabel: React.FC<Props> = ({ box, y, text, color }) => {
  const left = box.x ?? 0;
  const width = box.width ?? 0;

  return (
    <g>
      {/* 狭い帯に名前を入れると隣とぶつかるので、そのときは罫だけにする。 */}
      {width > estimateTextWidth(text) + 8 && (
        <text
          x={left + width / 2}
          y={y - 9}
          fill={color}
          fontSize={LABEL_FONT_SIZE}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {text}
        </text>
      )}
      <line
        x1={left + 1}
        x2={left + width - 1}
        y1={y}
        y2={y}
        stroke={color}
        strokeOpacity={0.65}
        strokeWidth={2}
      />
    </g>
  );
};

export default ZoneLabel;
