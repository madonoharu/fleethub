import React from "react";

import type { LabelViewBox } from "./chartLabels";

/** 切れ目の波線の振幅と周期。 */
const BREAK_AMP = 3;
const BREAK_PERIOD = 11;

function wavePath(x0: number, x1: number, y: number): string {
  let d = `M ${x0} ${y}`;

  for (let x = x0; x < x1; x += BREAK_PERIOD) {
    const q = BREAK_PERIOD / 4;
    const h = BREAK_PERIOD / 2;
    d += ` q ${q} ${-BREAK_AMP} ${h} 0 q ${q} ${BREAK_AMP} ${h} 0`;
  }

  return d;
}

interface Props {
  /** 切れ目の帯。 */
  box: LabelViewBox & { height?: number };
  color: string;
}

/**
 * 省略軸の切れ目。
 *
 * 軸をまたぐ短い波線を上下の縁に引く。図全体を横切らせると
 * 損傷帯や累計線と喧嘩するので、印は軸の周りだけに留める。
 */
const AxisBreak: React.FC<Props> = ({ box, color }) => {
  const left = (box.x ?? 0) - 10;
  const right = (box.x ?? 0) + 26;
  const top = box.y ?? 0;
  const bottom = top + (box.height ?? 0);

  return (
    <g>
      <path
        d={wavePath(left, right, top)}
        fill="none"
        stroke={color}
        strokeWidth={1}
      />
      <path
        d={wavePath(left, right, bottom)}
        fill="none"
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

export default AxisBreak;
