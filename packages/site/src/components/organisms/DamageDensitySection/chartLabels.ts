/** 損傷状態の名前など、図に直接置く文字。 */
export const LABEL_FONT_SIZE = 11;

/** 軸の目盛の文字。 */
export const AXIS_FONT_SIZE = 12;

/** ReferenceArea / ReferenceLine の viewBox は矩形として来る。 */
export interface LabelViewBox {
  x?: number;
  y?: number;
  width?: number;
}

/** 全角はフォントサイズぶん、半角はその 0.55 倍として文字列の幅を見積もる。 */
export function estimateTextWidth(text: string): number {
  let width = 0;

  for (const char of text) {
    width +=
      char.charCodeAt(0) > 0x2e80 ? LABEL_FONT_SIZE : LABEL_FONT_SIZE * 0.55;
  }

  return width;
}
