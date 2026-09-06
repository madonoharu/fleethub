import { decomposeColor, colors as muiColors } from "@mui/material";

/**
 * 棒の色。自艦は青、比較艦は桃。
 *
 * 作戦室の下地は紺（`#141e30`、色相219度）で、背景の損傷帯は不透明度 8.5% しか
 * 乗らない。つまり背景として効いているのは下地1色だけ。既定の青（207度）は
 * その 12 度隣なので、色相ではなく明るさでしか分離できない。水色寄りの
 * 201度まで振ると下地から 18 度離れ、濃い側も使えるようになる。
 *
 * 下地が紺なので、明るいほうへ振るとサイトから浮く。離せた分だけ濃い側に置く。
 */
export const PENETRATION_COLOR = muiColors.lightBlue[700];
export const COMPARE_COLOR = muiColors.pink[400];

/**
 * 攻撃種類ごとの段に使う、青の明度ランプの両端。
 *
 * 背景の損傷帯がすでに5色を使っているので、段で色相を振ると帯と喧嘩する。
 * 「ひとつの合計を切り分けたもの」という関係も、同系の明暗のほうが素直に伝わる。
 * 段は発動率の小さいものから積むので、明るいほど主力という読み方が色に乗る。
 *
 * 決めるのは端の2色だけで、間は段の数に合わせて等分する。使える幅は段の数に
 * よらないので、いつでも端から端まで使い切る。
 *
 * 下端は下地から浮く必要があるので下地比 3.5 まで。上端は白っぽくなって
 * 紺から浮く手前の lightBlue400 で止める。
 */
const STACK_DARK = muiColors.lightBlue[800];
const STACK_LIGHT = muiColors.lightBlue[400];

/**
 * 「その他」の色。まとめたものなので、ランプの中に置くと明るさの順が壊れる。
 * 色相は変えずに彩度だけ落として別枠にする。積む位置は発動率で決まるので、
 * ランプのどこに挟まっても「まとめたもの」だと分かる必要がある。
 */
export const OTHER_COLOR = muiColors.blueGrey[500];

/**
 * ランプの両端を等分した色。
 *
 * sRGB のまま混ぜても、この2色の間では明るさがほぼ等比に並ぶ。
 * 隣り合う段の明るさの比は4段で 1.26、5段で 1.19。
 */
export function rampColor(index: number, count: number) {
  if (count <= 1 || index <= 0) return STACK_DARK;
  if (index >= count - 1) return STACK_LIGHT;

  const dark = decomposeColor(STACK_DARK).values;
  const light = decomposeColor(STACK_LIGHT).values;
  const t = index / (count - 1);

  // 端の2色と同じ書き方にしたいので、rgb() ではなく16進で返す。
  const hex = [0, 1, 2]
    .map((i) => Math.round(dark[i] + (light[i] - dark[i]) * t))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");

  return `#${hex}`;
}

/**
 * 累計確率の線が1本のときの色。棒から最も遠い補色。
 *
 * 累計は確率の量ではなく右軸の補助線なので、棒の系統から離しておくほうが
 * 役割が伝わる。青（201度）の補色は21度で、琥珀が15度違いの36度。
 */
export const SOLO_CUMULATIVE_COLOR = muiColors.orange[300];

/**
 * 比較しているときの累計線。自分の棒と同じ色相の、明るい側。
 *
 * 線が2本になると、まず「どちらの艦か」が分からなければならない。
 * 色相はどちらの艦か、明るさは棒か線かを表すことにする。
 *
 * ここで補色を使うと、線は自分の棒からいちばん遠い色になる。2組並べると
 * どちらの線も相手の棒のほうが近くなり（琥珀36度は桃340度と56度違い、
 * 青緑174度は青201度と27度違い）、目には襷掛けに見える。
 *
 * 明るさは棒より必ず上（下地比 10.1 と 7.5、棒はいちばん明るくても 7.25）。
 * 線は細いので、明るさでも棒より前に出しておく。
 */
export const CUMULATIVE_COLOR = muiColors.lightBlue[200];
export const COMPARE_CUMULATIVE_COLOR = muiColors.pink[200];
