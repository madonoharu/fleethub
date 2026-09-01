import { useTheme } from "@emotion/react";
import { Box } from "@mui/material";
import { useTranslation } from "next-i18next";
import React, { useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Label,
  Legend,
  Line,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  BrokenRateAxis,
  DamageChartRow,
  DamageDensityStats,
  DamageStateZone,
} from "../../../utils";
import {
  AXIS_HEADROOM,
  BREAK_THRESHOLD,
  createBrokenRateAxis,
  createDamageAxisTicks,
  createDamageStateZones,
  createRateAxisTicks,
  getClippedRateMax,
  toBrokenAxis,
  toPercent,
} from "../../../utils";

import AxisBreak from "./AxisBreak";
import type { LegendRow } from "./ChartLegend";
import ChartLegend, { LEGEND_HEIGHT } from "./ChartLegend";
import ClipMark from "./ClipMark";
import type { DamageBreakdownItem } from "./DamageDensityTooltip";
import DamageDensityTooltip from "./DamageDensityTooltip";
import ZoneLabel from "./ZoneLabel";
import type { LabelViewBox } from "./chartLabels";
import { AXIS_FONT_SIZE } from "./chartLabels";
import {
  COMPARE_COLOR,
  COMPARE_CUMULATIVE_COLOR,
  CUMULATIVE_COLOR,
  OTHER_COLOR,
  PENETRATION_COLOR,
  SOLO_CUMULATIVE_COLOR,
  rampColor,
} from "./colors";

interface Props {
  rows: DamageChartRow[];
  stats: DamageDensityStats;
  targetMaxHp: number | undefined;
  targetCurrentHp: number | undefined;
  /** 攻撃種類ごとの寄与を積み上げる場合の系列。`rows.breakdown` と同じ順。 */
  breakdownItems?: DamageBreakdownItem[] | undefined;
  /** 凡例の見出し。 */
  mainLabel: string;
  compareLabel?: string | undefined;
  /** ツールチップの見出し。凡例と違い「ダメージ発生確率」は付けず艦名だけ。 */
  mainName?: string | undefined;
  compareName?: string | undefined;
}

const HEIGHT = 288;

/** 損傷状態の名前を図の外に出すぶんの余白。 */
const MARGIN_TOP = 20;

/**
 * 棒を1本ずつ SVG 要素にする <Bar> は本数に比例して重い（401本で軸だけの場合の6倍）。
 * 棒として読めるのはプロット幅からせいぜいこの本数までなので、それを超えたら
 * 1本のパスで済む階段状の <Area> に切り替える。見た目はほぼ変わらない。
 */
const BAR_LIMIT = 120;

const EPS = 1e-9;

/** 凡例で on/off するときの系列の名前。 */
const SERIES = {
  main: "main",
  compare: "compare",
  cumulative: "cumulative",
  breakdown: "breakdown",
} as const;

/**
 * 積み上げの段の識別子。
 *
 * 段の並びは発動率で決まり、装備を変えると順序も数も変わる。添字で覚えると
 * 消したはずの種類とは別の段が消えたままになるので、攻撃種類のキーで覚える。
 */
function breakdownId(key: string | null) {
  return `${SERIES.breakdown}:${key ?? "*"}`;
}

/** 分布・切れ目・頭を1本の棒として積むための識別子。 */
const STACK_ID = "dist";
/** 比較側は別の棒なので、積み上げも分ける。 */
const COMPARE_STACK_ID = "compare";

const DamageDensityChart: React.FC<Props> = ({
  rows,
  stats,
  targetMaxHp,
  targetCurrentHp,
  breakdownItems,
  mainLabel,
  compareLabel,
  mainName,
  compareName,
}) => {
  const theme = useTheme();
  const { t } = useTranslation("common");
  // 凡例を押して消した系列。軸は消しても動かさない（形を比べるため）。
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());

  const toggleSeries = (id: string) =>
    setHidden((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const shown = (id: string) => !hidden.has(id);

  const hasCompare = Boolean(compareLabel);
  const maxDamage = rows.length ? (rows.at(-1) as DamageChartRow).damageEnd : 0;

  const zones = useMemo<DamageStateZone[]>(() => {
    if (targetMaxHp == null || targetMaxHp <= 0 || targetCurrentHp == null) {
      return [];
    }

    return createDamageStateZones(targetMaxHp, targetCurrentHp, maxDamage);
  }, [targetMaxHp, targetCurrentHp, maxDamage]);

  const ticks = useMemo(
    () => createDamageAxisTicks(zones, maxDamage),
    [zones, maxDamage],
  );

  // ダメージ0（命中しない確率）の棒だけが桁違いに高い。差が大きいときは
  // 軸を二段に切り、この棒の頭だけを上段の別の縮尺に逃がす。
  const bodyMax = useMemo(() => getClippedRateMax(rows), [rows]);
  const peakMain = rows[0]?.rate ?? 0;
  const peakCompare = rows[0]?.compareRate ?? 0;
  // 軸は凡例で系列を消しても動かないよう、全系列を覆う値で決める。
  const axisPeak = rows[0]?.axisRate ?? 0;
  const needsClip = axisPeak > bodyMax * BREAK_THRESHOLD;

  // 重ねているときは2本の棒が同じビンを分け合うので、上段に頭を継ぎ足すと
  // どちらの続きか分からなくなる。単系列のときだけ軸を切る。
  const broken = useMemo<BrokenRateAxis | null>(
    () =>
      needsClip && !hasCompare ? createBrokenRateAxis(bodyMax, axisPeak) : null,
    [needsClip, hasCompare, bodyMax, axisPeak],
  );

  // 棒を止める高さ。切らずに済むときは全部収まるので誰も止まらない。
  const rateCap = broken
    ? broken.cap
    : needsClip
      ? bodyMax
      : Math.max(bodyMax, axisPeak);
  const rateAxisMax = broken ? broken.axisMax : rateCap * AXIS_HEADROOM;
  const rateTicks = useMemo(
    () =>
      broken
        ? [...createRateAxisTicks(broken.cap), broken.gapTo, broken.axisMax]
        : createRateAxisTicks(rateCap),
    [broken, rateCap],
  );

  // 棒はダメージ値を中心に描かれるので、両端の棒は半分がプロットの外へ出て
  // 縦軸の目盛と重なる。半ビンぶん内側に寄せて、棒が軸の領域へ出ないようにする。
  const binSize =
    rows.length > 1 ? Math.max(1, rows[1].damage - rows[0].damage) : 1;
  const domainMin = -binSize / 2;
  const domainMax = maxDamage + binSize / 2;
  // 目盛が 0.1% 未満の刻みになるときだけ桁を増やす。
  const rateDecimals = createRateAxisTicks(rateCap).some(
    (value) => Math.abs(value * 1000 - Math.round(value * 1000)) > 1e-9,
  )
    ? 2
    : 1;

  // 上段の窓の両端。同じ表示にならない最小の桁で出す。
  const upperDecimals = broken
    ? ([0, 1, 2].find(
        (digits) =>
          toPercent(broken.from, digits) !== toPercent(broken.to, digits),
      ) ?? 2)
    : 0;

  /** 目盛の値は軸の座標なので、上段の2本だけは元の値に読み替える。 */
  const formatRateTick = (value: number) => {
    if (!broken || value <= broken.cap + EPS) {
      return toPercent(value, rateDecimals);
    }

    return toPercent(
      value < broken.axisMax - EPS ? broken.from : broken.to,
      upperDecimals,
    );
  };

  const axisProps = {
    fontSize: AXIS_FONT_SIZE,
    stroke: theme.palette.text.secondary,
  } as const;

  const useBars = rows.length <= BAR_LIMIT;

  const hasBreakdown = Boolean(breakdownItems?.length);

  /** 段ごとの色。「その他」はランプから外し、残りでランプを使い切る。 */
  const stackFills = useMemo(() => {
    const items = breakdownItems ?? [];
    const rampCount = items.filter((item) => item.key !== null).length;
    let rampIndex = 0;

    return items.map((item) =>
      item.key === null ? OTHER_COLOR : rampColor(rampIndex++, rampCount),
    );
  }, [breakdownItems]);

  /**
   * 割合ダメージのぶんを別の段として積むか。
   *
   * 比較していないときは攻撃種類で積み上げるので、棒はそちらに使う。
   * 割合を外すぶんは分布そのものから引いてある。
   */
  const hasScratch = hasCompare && rows.some((row) => row.scratch > 0);
  const hasCompareScratch =
    hasCompare && rows.some((row) => (row.compareScratch ?? 0) > 0);

  /**
   * 頭打ちの高さで止めて描く。超えた分は省略軸の上段に継ぐ。
   */
  const capped = (value: number) => Math.min(value, rateCap);

  /** 割合ダメージとそれ以外に切り分ける。合計は `capped(rate)` のまま。 */
  const cappedPart = (rate: number, scratch: number, scratchPart: boolean) => {
    const total = capped(rate);
    const part = Math.min(scratch, total);

    return scratchPart ? part : total - part;
  };

  const scratchLabel = t("DamageDistribution.Scratch");

  /**
   * 積み上げでは系列ごとに切ると内訳の比率が壊れるので、
   * 合計が頭打ちを超える分だけ全系列を一様に縮める。
   */
  const cappedStack = (row: DamageChartRow, index: number) => {
    const value = row.breakdown[index] ?? 0;
    return row.rate > rateCap ? (value * rateCap) / row.rate : value;
  };

  /**
   * 上段に描く棒の頭。積み上げているときは内訳の比で切り分ける。
   * 上段の窓より下に収まる部分は下段で描き切っているので落とす。
   *
   * 高さは軸の座標の差。分布と同じ積み上げの続きとして描くので、
   * 棒の位置と幅は recharts が分布に与えたものとそのまま揃う。
   */
  const headSegments = useMemo(() => {
    const row = rows[0];
    if (!broken || !row) return [];

    const shares = hasBreakdown
      ? (breakdownItems ?? []).map((_, index) => row.breakdown[index] ?? 0)
      : [row.rate];

    let acc = 0;

    return shares
      .map((share, index) => {
        const from = acc;
        acc += share;
        return { index, from, to: acc };
      })
      .filter((segment) => segment.to > broken.from)
      .map((segment) => ({
        index: segment.index,
        height:
          toBrokenAxis(broken, segment.to) -
          toBrokenAxis(broken, Math.max(segment.from, broken.from)),
      }));
  }, [broken, rows, hasBreakdown, breakdownItems]);

  /** 頭打ちにした棒の実値。軸の座標と系列の色を添えて置く。 */
  const clipMarks = useMemo(() => {
    if (broken) {
      if (hidden.has(SERIES.main)) return [];

      return [
        {
          id: SERIES.main,
          value: peakMain,
          axis: toBrokenAxis(broken, peakMain),
          color: PENETRATION_COLOR,
        },
      ];
    }

    if (!needsClip) return [];

    // 二段にできないときは、実値を軸の最上部に系列の色で並べる。
    return [
      {
        id: SERIES.main,
        value: peakMain,
        axis: rateAxisMax,
        color: PENETRATION_COLOR,
      },
      {
        id: SERIES.compare,
        value: peakCompare,
        axis: rateAxisMax * 0.93,
        color: COMPARE_COLOR,
      },
    ].filter((mark) => mark.value > rateCap && !hidden.has(mark.id));
  }, [broken, needsClip, hidden, peakMain, peakCompare, rateAxisMax, rateCap]);

  // 線が1本のときだけ補色。2本並べると補色は相手の棒に寄ってしまう。
  const cumulativeColor = hasCompare ? CUMULATIVE_COLOR : SOLO_CUMULATIVE_COLOR;

  const legendRows = useMemo<LegendRow[]>(() => {
    const cumulativeLabel = t("DamageDistribution.Cumulative");

    if (hasBreakdown) {
      return [
        ...(breakdownItems ?? []).map((item, index) => ({
          id: breakdownId(item.key),
          label: item.label,
          fill: stackFills[index],
        })),
        {
          id: SERIES.cumulative,
          label: cumulativeLabel,
          line: cumulativeColor,
        },
      ];
    }

    // 比較しているときは、艦ごとに分布（塗り）と累計（線）を1つにまとめる。
    // 1行に収めたいので、見出しは艦名だけにする。割合は塗り分けていないので
    // 凡例には出さず、「割合」のチェックボックスで切り替える。
    if (hasCompare) {
      return [
        {
          id: SERIES.main,
          label: mainName || mainLabel,
          fill: PENETRATION_COLOR,
          line: cumulativeColor,
        },
        {
          id: SERIES.compare,
          label: compareName || compareLabel || "",
          fill: COMPARE_COLOR,
          line: COMPARE_CUMULATIVE_COLOR,
        },
      ];
    }

    return [
      { id: SERIES.main, label: mainLabel, fill: PENETRATION_COLOR },
      { id: SERIES.cumulative, label: cumulativeLabel, line: cumulativeColor },
    ];
  }, [
    t,
    cumulativeColor,
    hasBreakdown,
    breakdownItems,
    stackFills,
    hasCompare,
    mainLabel,
    compareLabel,
    mainName,
    compareName,
  ]);

  const renderDistribution = (
    dataKey: (row: DamageChartRow) => number,
    name: string,
    color: string,
    opacity: number,
    stackId?: string,
    {
      legend = true,
      outline = true,
    }: {
      /** 積み上げの都合で足しただけの段は凡例に出さない。 */
      legend?: boolean;
      /**
       * Area で描くとき、輪郭は高さ0 のところにも引かれる。
       * 一部のビンにしか立たない段に輪郭を付けると、
       * 立っていないビンでも積み上げの天面がその色の線で覆われてしまう。
       */
      outline?: boolean;
    } = {},
  ) =>
    useBars ? (
      <Bar
        yAxisId="pmf"
        dataKey={dataKey}
        name={name}
        stackId={stackId}
        legendType={legend ? undefined : "none"}
        fill={color}
        fillOpacity={opacity}
        isAnimationActive={false}
      />
    ) : (
      <Area
        yAxisId="pmf"
        dataKey={dataKey}
        name={name}
        stackId={stackId}
        legendType={legend ? undefined : "none"}
        type="stepAfter"
        fill={color}
        fillOpacity={opacity}
        stroke={outline ? color : "none"}
        strokeWidth={outline ? 0.75 : 0}
        dot={false}
        activeDot={false}
        isAnimationActive={false}
      />
    );

  // 中央値と上位5% は線だけ引く。ラベルを付けると同じ段で互いに重なるうえ、
  // 値はツールチップで読めるので、図の中は線の位置だけを示す。
  const renderMarkLine = (value: number, opacity: number) => (
    <ReferenceLine
      yAxisId="pmf"
      // 縦線が指すのはダメージ量なので、縦軸を切っていても通しで引ける。
      x={value}
      stroke={theme.palette.text.primary}
      strokeOpacity={opacity}
      strokeWidth={1.25}
      strokeDasharray="5 4"
    />
  );

  return (
    <Box sx={{ width: "100%", height: HEIGHT }}>
      <ResponsiveContainer>
        <ComposedChart
          data={rows}
          margin={{ top: MARGIN_TOP, right: 8, bottom: 0, left: 0 }}
          barGap={0}
        >
          {/* 損傷状態は棒の色ではなく背景の帯で示す。位置＝与ダメージ量として自己説明される。 */}
          {zones.map((zone) => (
            <ReferenceArea
              key={zone.state}
              yAxisId="pmf"
              // 帯は端まで塗る。上で軸を内側に寄せたぶん左端に隙間が空くのを埋める。
              x1={zone.from === 0 ? domainMin : zone.from}
              x2={zone.to > maxDamage ? domainMax : zone.to}
              // 最後の帯は軸の右端を越えるので、捨てずにプロット領域で切る。
              ifOverflow="hidden"
              fill={theme.colors[`Damage${zone.state}` as const]}
              fillOpacity={0.085}
            >
              <Label
                content={({ viewBox }) => {
                  const box = viewBox as LabelViewBox;

                  return (
                    <ZoneLabel
                      box={box}
                      y={box.y ?? 0}
                      text={t(`DamageState.${zone.state}`)}
                      color={theme.colors[`Damage${zone.state}` as const]}
                    />
                  );
                }}
              />
            </ReferenceArea>
          ))}

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={theme.palette.divider}
          />
          {/* X軸はダメージ量。軸名を置くと最後の目盛か凡例のどちらかに必ず重なるので、
              見出しと帯とツールチップに任せる。 */}
          <XAxis
            {...axisProps}
            dataKey="damage"
            type="number"
            domain={[domainMin, domainMax]}
            ticks={ticks}
            allowDecimals={false}
          />
          <YAxis
            {...axisProps}
            yAxisId="pmf"
            width={44}
            domain={[0, rateAxisMax]}
            ticks={rateTicks}
            allowDataOverflow
            tickFormatter={formatRateTick}
          />
          <YAxis
            {...axisProps}
            yAxisId="cdf"
            orientation="right"
            // 100% が下段の天井にちょうど来るようにする。上に伸ばしたぶんは
            // 左軸の上段と切れ目の場所なので、累計線をそこへ入れない。
            domain={[0, broken ? broken.axisMax / broken.cap : AXIS_HEADROOM]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            width={44}
            tickFormatter={(value: number) => toPercent(value, 0)}
          />
          <RechartsTooltip
            content={
              <DamageDensityTooltip
                mainName={mainName}
                compareName={compareName}
                breakdownItems={breakdownItems}
              />
            }
          />
          <Legend
            height={LEGEND_HEIGHT}
            content={
              <ChartLegend
                rows={legendRows}
                hidden={hidden}
                onToggle={toggleSeries}
              />
            }
          />

          {renderMarkLine(stats.median, 0.52)}
          {renderMarkLine(stats.upper5, 0.3)}

          {/* 積み上げても総和は合計そのものなので、棒の高さは単色のときと変わらない。 */}
          {hasBreakdown
            ? breakdownItems?.map((item, index) =>
                // 種類名が重複しても壊れないよう添字を key にする。
                shown(breakdownId(item.key)) ? (
                  <React.Fragment key={index}>
                    {renderDistribution(
                      (row) => cappedStack(row, index),
                      item.label,
                      stackFills[index],
                      1,
                      STACK_ID,
                    )}
                  </React.Fragment>
                ) : null,
              )
            : shown(SERIES.main) &&
              renderDistribution(
                // 装甲貫通のぶんは割合の表示に関係なく同じ高さ。
                hasScratch
                  ? (row) => cappedPart(row.rate, row.scratch, false)
                  : (row) => capped(row.rate),
                mainLabel,
                PENETRATION_COLOR,
                1,
                broken || hasScratch ? STACK_ID : undefined,
              )}

          {/* 割合ダメージのぶん。棒が2本並んでいるところをさらに塗り分けると
              どちらの割合なのか読めなくなるので、艦の色のまま積む。 */}
          {hasScratch &&
            shown(SERIES.main) &&
            renderDistribution(
              (row) => cappedPart(row.rate, row.scratch, true),
              scratchLabel,
              PENETRATION_COLOR,
              1,
              STACK_ID,
              { outline: false },
            )}

          {/* 切れ目のぶんの透明な段と、その上に継ぐ棒の頭。
              分布と同じ積み上げに載せるので、棒の位置と幅がずれない。 */}
          {broken && shown(SERIES.main) && (
            <>
              {renderDistribution(
                (row) => (row === rows[0] ? broken.gapTo - broken.cap : 0),
                "",
                "none",
                0,
                STACK_ID,
                { legend: false, outline: false },
              )}
              {headSegments.map((segment) => (
                <React.Fragment key={segment.index}>
                  {renderDistribution(
                    (row) => (row === rows[0] ? segment.height : 0),
                    "",
                    hasBreakdown
                      ? stackFills[segment.index]
                      : PENETRATION_COLOR,
                    1,
                    STACK_ID,
                    { legend: false, outline: false },
                  )}
                </React.Fragment>
              ))}
            </>
          )}
          {hasCompare && !hasBreakdown && shown(SERIES.compare) && (
            <>
              {renderDistribution(
                hasCompareScratch
                  ? (row) =>
                      cappedPart(
                        row.compareRate ?? 0,
                        row.compareScratch ?? 0,
                        false,
                      )
                  : (row) => capped(row.compareRate ?? 0),
                compareLabel ?? "",
                COMPARE_COLOR,
                0.75,
                hasCompareScratch ? COMPARE_STACK_ID : undefined,
              )}
              {hasCompareScratch &&
                renderDistribution(
                  (row) =>
                    cappedPart(
                      row.compareRate ?? 0,
                      row.compareScratch ?? 0,
                      true,
                    ),
                  scratchLabel,
                  COMPARE_COLOR,
                  0.75,
                  COMPARE_STACK_ID,
                  { outline: false },
                )}
            </>
          )}

          {/* 軸の切れ目。帯の上下の縁に波線を引く。 */}
          {broken && shown(SERIES.main) && (
            <ReferenceArea
              yAxisId="pmf"
              x1={domainMin}
              x2={domainMax}
              y1={broken.gapFrom}
              y2={broken.gapTo}
              fill="none"
            >
              <Label
                content={({ viewBox }) => (
                  <AxisBreak
                    box={viewBox as LabelViewBox & { height?: number }}
                    color={theme.palette.text.secondary}
                  />
                )}
              />
            </ReferenceArea>
          )}

          {/* 左軸に置くので、位置は図から取る。 */}
          {clipMarks.map((mark) => (
            <ReferenceDot
              key={mark.id}
              yAxisId="pmf"
              x={domainMin}
              y={mark.axis}
              r={0}
            >
              <Label
                content={({ viewBox }) => {
                  const box = viewBox as LabelViewBox;

                  return (
                    <ClipMark
                      x={box.x ?? 0}
                      y={box.y ?? 0}
                      text={toPercent(mark.value, 1)}
                      color={mark.color}
                    />
                  );
                }}
              />
            </ReferenceDot>
          ))}

          {(hasCompare ? shown(SERIES.main) : shown(SERIES.cumulative)) && (
            <Line
              yAxisId="cdf"
              dataKey="cumulative"
              name={t("DamageDistribution.Cumulative")}
              type="stepAfter"
              dot={false}
              strokeWidth={2}
              stroke={cumulativeColor}
              isAnimationActive={false}
            />
          )}
          {hasCompare && shown(SERIES.compare) && (
            <Line
              yAxisId="cdf"
              dataKey="compareCumulative"
              name={`${t("DamageDistribution.Cumulative")} (${
                compareLabel ?? ""
              })`}
              type="stepAfter"
              dot={false}
              strokeWidth={2}
              stroke={COMPARE_CUMULATIVE_COLOR}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default React.memo(DamageDensityChart);
