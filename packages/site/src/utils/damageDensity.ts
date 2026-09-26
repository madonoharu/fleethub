import type { AttackReport, DamageState, Histogram } from "fleethub-core";

export type DamageDensity = Histogram<number, number>;

/** 加重合算に必要な最小限の形。テストで素のオブジェクトを渡せるようにしている。 */
export type DamageDensitySource = Record<
  string,
  Pick<AttackReport<unknown>, "proc_rate" | "damage">
>;

export interface DamageDensityPoint {
  damage: number;
  rate: number;
  cumulative: number;
}

export interface DamageDensityStats {
  /** damage 昇順。0 から最大値まで欠損を rate: 0 で埋めた密な配列。 */
  points: DamageDensityPoint[];
  /** 全確率質量。Σ proc_rate なので 1 未満になり得る。 */
  total: number;
  /** 中央値。P(ダメージ <= d) >= total/2 となる最小の d。 */
  median: number | null;
  /** 上位5%（95パーセンタイル） */
  upper5: number | null;
}

export interface DamageChartRow {
  damage: number;
  /** ビンの末尾ダメージ値（binSize が 1 なら damage と同じ） */
  damageEnd: number;
  /** 棒の色分け用。対象艦の耐久が不明なら null。 */
  state: DamageState | null;
  rate: number;
  cumulative: number;
  compareRate: number | null;
  compareCumulative: number | null;
  /** 攻撃種類ごとの寄与（発動率で加重済み）。積み上げ表示のときだけ埋まる。 */
  breakdown: number[];
  noPenetration: number;
  compareNoPenetration: number | null;
  /**
   * 軸を決めるための値。そのビンの全系列の最大。
   *
   * 凡例で系列を消しても、貫通なしの算入を切り替えても軸が動かないよう、
   * 描いている値ではなくこちらで決める。
   */
  axisRate: number;
}

/** 損傷が軽いほうから順に並べた損傷状態。ダメージ軸の左から右の順でもある。 */
const DAMAGE_STATES: DamageState[] = [
  "Normal",
  "Shouha",
  "Chuuha",
  "Taiha",
  "Sunk",
];

const EPS = 1e-9;

/**
 * `penetration` は `all` から `noPenetration` を引いたもの。質量を 0 へ動かさず
 * 取り除くので、棒から貫通なしの段を落としたのと同じ形になる。
 */
export type DensityKind = "all" | "noPenetration" | "penetration";

function pickDensity(
  report: Pick<AttackReport<unknown>, "damage">,
  kind: DensityKind,
): DamageDensity | undefined {
  const damage = report.damage;
  if (!damage) return undefined;

  if (kind === "noPenetration") {
    return damage.damage_density_no_penetration ?? undefined;
  }

  if (kind === "penetration") {
    const all = damage.damage_density;
    const noPenetration = damage.damage_density_no_penetration;
    if (!all || !noPenetration) return undefined;

    const result: Record<number, number> = {};

    for (const [key, rate] of Object.entries(all)) {
      if (typeof rate !== "number") continue;

      // 加算順が違うので、一致する値でも丸め誤差の幅で正にも負にも振れる。
      const value = rate - (noPenetration[Number(key) as never] ?? 0);
      if (value > rate * EPS) result[Number(key)] = value;
    }

    return result;
  }

  return damage.damage_density;
}

export const DEFAULT_MAX_CHART_POINTS = 512;

/**
 * Rust の `ActionReport::new` が `damage_state_density` を作るのと同じ意味論で、
 * 発動率かダメージ情報が欠けている攻撃が1つでもあれば null を返す。
 * 正規化はしない（上に並ぶ分布バーの数値と一致させるため）。
 */
export function mergeDamageDensity(
  data: DamageDensitySource,
  kind: DensityKind = "all",
): DamageDensity | null {
  const result: Record<number, number> = {};
  let count = 0;

  for (const report of Object.values(data)) {
    const procRate = report.proc_rate;
    const density = pickDensity(report, kind);

    if (procRate == null || !density) {
      return null;
    }

    for (const [key, rate] of Object.entries(density)) {
      if (typeof rate !== "number") continue;

      const damage = Number(key);
      if (!Number.isFinite(damage)) continue;

      result[damage] = (result[damage] ?? 0) + rate * procRate;
    }

    count++;
  }

  return count ? result : null;
}

export interface DamageDensityBreakdownItem {
  /** `report.data` のキー。まとめた「その他」は null。 */
  key: string | null;
  /** 発動率。系列の確率質量そのものでもある。 */
  procRate: number;
  /** 発動率で加重済みの分布。`stats.total` は procRate に等しい。 */
  stats: DamageDensityStats;
}

/**
 * 「その他」にまとめずに残す系列の数。
 *
 * 色は端の2色を等分して作るので数では詰まらないが、段を増やすほど
 * 隣り合う明るさの差が詰まって境目が読めなくなる。
 */
export const DEFAULT_MAX_BREAKDOWN_SERIES = 4;

/**
 * 各系列は `proc_rate_k * density_k`。総和は `mergeDamageDensity` が返すものと
 * 完全に一致するので、積み上げても合計の形は変わらない。
 *
 * 昼戦は連撃・カットイン各種で7〜8種類になることがあり色が足りないので、
 * 発動率の小さいものは「その他」にまとめる。積む順は弱い攻撃ほど下（＝中央値順）。
 */
export function createDamageDensityBreakdown(
  data: DamageDensitySource,
  maxSeries = DEFAULT_MAX_BREAKDOWN_SERIES,
  kind: DensityKind = "all",
): DamageDensityBreakdownItem[] | null {
  const weighted: { key: string; procRate: number; density: DamageDensity }[] =
    [];

  for (const [key, report] of Object.entries(data)) {
    const procRate = report.proc_rate;
    const density = pickDensity(report, kind);

    if (procRate == null || !density) {
      return null;
    }

    if (procRate <= 0) continue;

    const scaled: Record<number, number> = {};
    for (const [damage, rate] of Object.entries(density)) {
      if (typeof rate === "number") {
        scaled[Number(damage)] = rate * procRate;
      }
    }

    weighted.push({ key, procRate, density: scaled });
  }

  if (!weighted.length) return null;

  const sorted = [...weighted].sort((a, b) => b.procRate - a.procRate);
  const kept = sorted.slice(0, maxSeries);
  const rest = sorted.slice(maxSeries);

  const items = kept
    .map(({ key, procRate, density }) => ({
      key: key as string | null,
      procRate,
      stats: toDamageDensityStats(density),
    }))
    .filter((item): item is DamageDensityBreakdownItem => item.stats !== null);

  if (rest.length) {
    const merged: Record<number, number> = {};
    let procRate = 0;

    rest.forEach((item) => {
      procRate += item.procRate;
      for (const [damage, rate] of Object.entries(item.density)) {
        if (typeof rate !== "number") continue;
        merged[Number(damage)] = (merged[Number(damage)] ?? 0) + rate;
      }
    });

    const stats = toDamageDensityStats(merged);
    if (stats) {
      items.push({ key: null, procRate, stats });
    }
  }

  // 発動率の小さいものほど下に積む。上へ行くほど太い帯になるので、
  // どれが主力かが厚みで読める。同率なら強いほうを下にする。
  return items.sort(
    (a, b) =>
      a.procRate - b.procRate || (b.stats.median ?? 0) - (a.stats.median ?? 0),
  );
}

function quantile(
  points: DamageDensityPoint[],
  total: number,
  q: number,
): number {
  const threshold = total * (q - EPS);
  const found = points.find((point) => point.cumulative >= threshold);
  return found ? found.damage : points[points.length - 1].damage;
}

export function toDamageDensityStats(
  density: DamageDensity | null | undefined,
): DamageDensityStats | null {
  if (!density) return null;

  const entries = Object.entries(density)
    .map(([key, rate]) => [Number(key), rate] as const)
    .filter(
      (entry): entry is readonly [number, number] =>
        Number.isFinite(entry[0]) &&
        entry[0] >= 0 &&
        typeof entry[1] === "number" &&
        entry[1] > 0,
    );

  if (!entries.length) {
    return {
      points: [{ damage: 0, rate: 0, cumulative: 0 }],
      total: 0,
      median: null,
      upper5: null,
    };
  }

  const max = entries.reduce((acc, [damage]) => Math.max(acc, damage), 0);
  const rates = new Float64Array(max + 1);

  entries.forEach(([damage, rate]) => {
    rates[damage] += rate;
  });

  const points: DamageDensityPoint[] = [];
  let cumulative = 0;

  for (let damage = 0; damage <= max; damage++) {
    cumulative += rates[damage];
    points.push({ damage, rate: rates[damage], cumulative });
  }

  return {
    points,
    total: cumulative,
    median: quantile(points, cumulative, 0.5),
    upper5: quantile(points, cumulative, 0.95),
  };
}

/** P(ダメージ >= x) */
export function getTailRate(stats: DamageDensityStats, x: number): number {
  const { points, total } = stats;
  const index = Math.ceil(x) - 1;

  if (index < 0) return total;
  if (index >= points.length) return 0;

  return Math.max(total - points[index].cumulative, 0);
}

/**
 * その損傷状態になる残耐久の上限。
 * `crates/fleethub-core/src/types/damage_state.rs` の `DamageState::bound` と同じ。
 */
export function getDamageStateBound(state: DamageState, maxHp: number): number {
  switch (state) {
    case "Normal":
      return maxHp;
    case "Shouha":
      return Math.floor((maxHp * 3) / 4);
    case "Chuuha":
      return Math.floor(maxHp / 2);
    case "Taiha":
      return Math.floor(maxHp / 4);
    case "Sunk":
      return 0;
  }
}

/** `DamageState::new` と同じ。u16 の除算に合わせて切り捨てる。 */
export function getDamageState(maxHp: number, currentHp: number): DamageState {
  if (currentHp <= 0) return "Sunk";
  if (currentHp <= getDamageStateBound("Taiha", maxHp)) return "Taiha";
  if (currentHp <= getDamageStateBound("Chuuha", maxHp)) return "Chuuha";
  if (currentHp <= getDamageStateBound("Shouha", maxHp)) return "Shouha";
  return "Normal";
}

export function getRequiredDamage(
  state: DamageState,
  maxHp: number,
  currentHp: number,
): number {
  return Math.max(currentHp - getDamageStateBound(state, maxHp), 0);
}

function readPoint(
  points: DamageDensityPoint[],
  index: number,
): DamageDensityPoint | undefined {
  return points[index];
}

interface CreateDamageChartRowsParams {
  main: DamageDensityStats;
  mainNoPenetration?: DamageDensityStats | null | undefined;
  compare?: DamageDensityStats | null | undefined;
  compareNoPenetration?: DamageDensityStats | null | undefined;
  /**
   * 軸を決めるための分布。省略すると描く分布そのもので決まる。
   *
   * 貫通なしを算入するかで描く分布は変わるが、そのたびに軸が伸び縮みすると
   * 切り替えて見比べられない。算入したほうの分布を常に渡して軸を固定する。
   */
  axisMain?: DamageDensityStats | null | undefined;
  axisCompare?: DamageDensityStats | null | undefined;
  /** 積み上げ表示用。合計を切り分けた系列。 */
  breakdown?: DamageDensityBreakdownItem[] | undefined;
  maxHp?: number | null | undefined;
  currentHp?: number | null | undefined;
  maxPoints?: number;
}

/**
 * 確率0のダメージ値も必ず埋める。数値軸の棒グラフは点の間隔から棒幅を決めるため、
 * 歯抜けのまま渡すと棒幅が壊れ、累計線が斜めに補間されてしまう。
 * ビンにまとめるときは確率を合計し、累計はビン末尾の値を採る。
 */
export function createDamageChartRows({
  main,
  mainNoPenetration,
  compare,
  compareNoPenetration,
  axisMain,
  axisCompare,
  breakdown,
  maxHp,
  currentHp,
  maxPoints = DEFAULT_MAX_CHART_POINTS,
}: CreateDamageChartRowsParams): DamageChartRow[] {
  // 比較側にしか無いダメージ値もあるので、すべてを覆う長さにする。
  // 軸を決める分布は描くものより長いことがあるので、これも数に入れる。
  const length = Math.max(
    main.points.length,
    compare?.points.length ?? 0,
    axisMain?.points.length ?? 0,
    axisCompare?.points.length ?? 0,
  );

  const binSize = Math.max(1, Math.ceil(length / maxPoints));
  const rows: DamageChartRow[] = [];

  for (let start = 0; start < length; start += binSize) {
    const end = Math.min(start + binSize, length) - 1;

    let rate = 0;
    let noPenetration = 0;
    let compareRate = 0;
    let compareNoPenetrationRate = 0;
    let axisMainRate = 0;
    let axisCompareRate = 0;
    const breakdownRates = breakdown ? breakdown.map(() => 0) : [];

    for (let i = start; i <= end; i++) {
      rate += readPoint(main.points, i)?.rate ?? 0;
      noPenetration += readPoint(mainNoPenetration?.points ?? [], i)?.rate ?? 0;
      compareRate += readPoint(compare?.points ?? [], i)?.rate ?? 0;
      compareNoPenetrationRate +=
        readPoint(compareNoPenetration?.points ?? [], i)?.rate ?? 0;
      axisMainRate += readPoint(axisMain?.points ?? main.points, i)?.rate ?? 0;
      axisCompareRate +=
        readPoint(axisCompare?.points ?? compare?.points ?? [], i)?.rate ?? 0;

      breakdown?.forEach((item, index) => {
        breakdownRates[index] += readPoint(item.stats.points, i)?.rate ?? 0;
      });
    }

    const mainLast = readPoint(
      main.points,
      Math.min(end, main.points.length - 1),
    );
    const compareLast = compare
      ? readPoint(compare.points, Math.min(end, compare.points.length - 1))
      : undefined;

    rows.push({
      damage: start,
      damageEnd: end,
      state:
        maxHp != null && maxHp > 0 && currentHp != null
          ? getDamageState(maxHp, currentHp - end)
          : null,
      rate,
      cumulative: mainLast?.cumulative ?? main.total,
      compareRate: compare ? compareRate : null,
      compareCumulative: compare
        ? (compareLast?.cumulative ?? compare.total)
        : null,
      breakdown: breakdownRates,
      noPenetration: Math.min(noPenetration, rate),
      compareNoPenetration: compare
        ? Math.min(compareNoPenetrationRate, compareRate)
        : null,
      axisRate: Math.max(axisMainRate, axisCompareRate),
    });
  }

  return rows;
}

export interface DamageStateZone {
  state: DamageState;
  from: number;
  /** 次の損傷状態になる最小ダメージ。Sunk は maxDamage + 1。 */
  to: number;
}

/** 棒の色分けの代わりに背景に敷く。残耐久が小さいと境界が重なり、幅 0 の帯は落とす。 */
export function createDamageStateZones(
  maxHp: number,
  currentHp: number,
  maxDamage: number,
): DamageStateZone[] {
  const bounds = DAMAGE_STATES.map((state) => ({
    state,
    from: getRequiredDamage(state, maxHp, currentHp),
  }));

  return bounds
    .map(({ state, from }, index) => ({
      state,
      from,
      to: bounds[index + 1]?.from ?? maxDamage + 1,
    }))
    .filter((zone) => zone.from < zone.to && zone.from <= maxDamage)
    .map((zone) => ({ ...zone, to: Math.min(zone.to, maxDamage + 1) }));
}

/**
 * X軸の目盛。等間隔ではなく損傷状態の境界値そのものを置く。
 * 「あと何ダメージ欲しいか」が軸から直接読めるようにするため。
 */
export function createDamageAxisTicks(
  zones: DamageStateZone[],
  maxDamage: number,
): number[] {
  const boundaries = zones
    .map((zone) => zone.from)
    .filter((value) => value <= maxDamage);

  const ticks = Array.from(new Set([0, ...boundaries])).sort((a, b) => a - b);

  // 分布の右端も置く。境界値と近すぎるときは境界値を優先して落とす。
  if (maxDamage - (ticks[ticks.length - 1] ?? 0) > maxDamage * 0.06) {
    ticks.push(maxDamage);
  }

  return ticks;
}

/**
 * 軸の上に取る余白の比率。
 *
 * 棒も累計線もここまでは届かないので、境界に置いた頭打ちの印と重ならない。
 * 左右どちらの軸も同じだけ空ける。
 */
export const AXIS_HEADROOM = 1.16;

/**
 * ダメージ1以上の棒の最大値。
 *
 * ダメージ0（命中しない確率）の棒は他より1桁大きく、そのままだと本体の山が潰れる。
 * 下段の軸はこの高さに合わせ、はみ出す棒は省略軸の上段に逃がす。
 */
export function getClippedRateMax(rows: DamageChartRow[]): number {
  let peak = 0;

  rows.slice(1).forEach((row) => {
    peak = Math.max(peak, row.axisRate);
  });

  if (peak > 0) return peak;

  return rows.reduce((acc, row) => Math.max(acc, row.axisRate), 0);
}

/**
 * 省略軸（二段スケール）。
 *
 * ダメージ0 の棒だけが桁違いに高いので、下段に実データの縮尺を、
 * 上段にその棒の頭だけを別の縮尺で置き、間を切り離す。
 */
export interface BrokenRateAxis {
  /** 下段の上限。棒はここで一度切れる。 */
  cap: number;
  /** 上段が表す値の範囲。 */
  from: number;
  to: number;
  /** 切れ目の帯。軸の単位。 */
  gapFrom: number;
  gapTo: number;
  /** 軸全体の上限。軸の単位。 */
  axisMax: number;
}

/** 下段と切れ目が図の高さに占める割合。残りが上段。 */
const BROKEN_LOWER_RATIO = 0.74;
const BROKEN_GAP_RATIO = 0.06;

/**
 * 軸を切る比の下限。
 *
 * これに満たない差なら軸を伸ばすだけで両方収まるので、切らずに全部描く。
 * 上段の窓は値の 7 割より下には広がらないので、この比なら窓が下段と重ならない。
 */
export const BREAK_THRESHOLD = 1.8;

/** 幅が `target` を下回らない、きりのいい刻み。 */
function niceStep(target: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const steps = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude);

  return steps.find((step) => step >= target * (1 - EPS)) ?? magnitude * 10;
}

/**
 * 上段の窓ときりのいい目盛を決める。
 *
 * 窓は `peak` を挟むきりのいい区間。値が端に寄ると目盛の数字と重なるので、
 * そのときは一段ぶん広げる。
 *
 * 窓が下段の天井まで下りてしまうときは切れないので null を返す。
 */
export function createBrokenRateAxis(
  cap: number,
  peak: number,
): BrokenRateAxis | null {
  const step = niceStep(peak * 0.15);

  let from = Math.floor(peak / step + EPS) * step;
  let to = Math.ceil(peak / step - EPS) * step;

  if (to - from < step * (1 - EPS)) to = from + step;
  if ((peak - from) / (to - from) < 0.15) from -= step;
  if ((to - peak) / (to - from) < 0.15) to += step;

  if (from <= cap) return null;

  const axisMax = cap / BROKEN_LOWER_RATIO;

  return {
    cap,
    from,
    to,
    gapFrom: cap,
    gapTo: cap + axisMax * BROKEN_GAP_RATIO,
    axisMax,
  };
}

/** 値を省略軸の座標に写す。上段の窓より下の値は窓の底に潰す。 */
export function toBrokenAxis(axis: BrokenRateAxis, value: number): number {
  if (value <= axis.cap) return value;

  const ratio = Math.max(0, value - axis.from) / (axis.to - axis.from);

  return axis.gapTo + ratio * (axis.axisMax - axis.gapTo);
}

/**
 * 左軸の目盛。上限は頭打ちの余白なので半端な値になる。目盛だけはきりのいい間隔で置き、
 * 上限そのものには打たない。区間数が `divisions` にいちばん近い刻みを選ぶ。
 */
export function createRateAxisTicks(rateMax: number, divisions = 4): number[] {
  if (!(rateMax > 0)) return [0];

  const magnitude = 10 ** Math.floor(Math.log10(rateMax));
  const steps = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10].map(
    (factor) => factor * magnitude,
  );

  let step = steps[steps.length - 1];
  let best = Infinity;

  steps.forEach((value) => {
    const intervals = Math.floor(rateMax / value + EPS);
    if (intervals < 1) return;

    const distance = Math.abs(intervals - divisions);
    // 同点なら刻みが大きいほう（目盛が少ないほう）を採る。
    if (distance <= best) {
      best = distance;
      step = value;
    }
  });

  const intervals = Math.floor(rateMax / step + EPS);

  return Array.from({ length: intervals + 1 }, (_, index) => index * step);
}
