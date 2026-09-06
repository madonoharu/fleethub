import styled from "@emotion/styled";
import { Alert } from "@mui/material";
import type { ActionReport, Comp } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React, { useMemo } from "react";

import { useAppDispatch, useRootSelector } from "../../../hooks";
import { appSlice } from "../../../store";
import type { DensityKind } from "../../../utils";
import {
  createDamageChartRows,
  createDamageDensityBreakdown,
  mergeDamageDensity,
  toDamageDensityStats,
} from "../../../utils";
import { Checkbox, Flexbox } from "../../atoms";
import { getAttackLabel } from "../../molecules";

import CompShipNameSelect from "./CompShipNameSelect";
import DamageDensityChart from "./DamageDensityChart";
import DamageDensityStats from "./DamageDensityStats";
import type { DamageBreakdownItem } from "./DamageDensityTooltip";
import { listCompShips, withCompShipOrder } from "./compShips";

type ReportLike = Pick<ActionReport<unknown>, "data">;

/**
 * 図が扱うのは常に全攻撃種類の発動率加重合計。
 *
 * 種類ごとの寄与は積み上げの段として1枚に出すので、種類を選ぶ操作は要らない。
 */
function selectDensity(report: ReportLike | undefined, kind: DensityKind) {
  return report ? mergeDamageDensity(report.data, kind) : null;
}

interface Props {
  report: ReportLike;
  targetMaxHp: number | undefined;
  targetCurrentHp: number | undefined;
  /** 比較セレクタを出す場合のみ渡す（攻撃側が自軍のときだけ） */
  comp?: Comp | undefined;
  attackerShipId?: string | undefined;
  /** 重ね合わせているときに、どちらの系列がどの艦かを凡例で示すために使う。 */
  attackerShipName?: string | undefined;
  compareShipId?: string | undefined;
  compareReport?: ReportLike | undefined;
  compareShipName?: string | undefined;
  onCompareShipChange?: ((id: string | undefined) => void) | undefined;
}

const DamageDensitySection: React.FCX<Props> = ({
  className,
  report,
  targetMaxHp,
  targetCurrentHp,
  comp,
  attackerShipId,
  attackerShipName,
  compareShipId,
  compareReport,
  compareShipName,
  onCompareShipChange,
}) => {
  const { t } = useTranslation("common");
  /**
   * 割合ダメージ（カスダメ）を算入するか。既定は算入。
   *
   * 外すと図全体が「少なくとも1発は装甲を貫通した場合」の話になる。棒だけでなく
   * 累計確率・中央値・上位5%・下に並ぶ確率も同じ分布から作る。総和は 1 未満に
   * なるので、累計線が 100% に届かないぶんが全弾割合だった確率にあたる。
   */
  const dispatch = useAppDispatch();
  // タブを移るとアンマウントされるので、読み方の好みは store に置く。
  // 左右のパネルで食い違うと見比べられないため、値も共有する。
  const includeScratch = useRootSelector(
    (root) => root.app.damageDensityIncludeScratch ?? true,
  );

  const kind: DensityKind = includeScratch ? "all" : "penetration";

  /**
   * 軸は算入したほうの分布で決める。
   *
   * 切り替えるたびに縦軸が伸び縮みすると、算入あり・なしを見比べられない。
   */
  const statsAll = useMemo(
    () => toDamageDensityStats(selectDensity(report, "all")),
    [report],
  );

  const statsPenetration = useMemo(
    () =>
      includeScratch
        ? null
        : toDamageDensityStats(selectDensity(report, "penetration")),
    [report, includeScratch],
  );

  const stats = includeScratch ? statsAll : statsPenetration;

  // 棒のうち「全弾が割合ダメージだった」ぶん。塗り分けに使う。
  // 算入しないときは分布から取り除いてあるので、切り分ける相手がいない。
  const statsScratchOnly = useMemo(
    () =>
      includeScratch
        ? toDamageDensityStats(selectDensity(report, "scratchOnly"))
        : null,
    [report, includeScratch],
  );

  const compareStatsAll = useMemo(
    () => toDamageDensityStats(selectDensity(compareReport, "all")),
    [compareReport],
  );

  const compareStatsPenetration = useMemo(
    () =>
      includeScratch
        ? null
        : toDamageDensityStats(selectDensity(compareReport, "penetration")),
    [compareReport, includeScratch],
  );

  const compareStats = includeScratch
    ? compareStatsAll
    : compareStatsPenetration;

  const compareStatsScratchOnly = useMemo(
    () =>
      includeScratch
        ? toDamageDensityStats(selectDensity(compareReport, "scratchOnly"))
        : null,
    [compareReport, includeScratch],
  );

  // 積み上げと重ね合わせ比較は同じ棒を取り合う。比較艦の選択のほうが
  // 明示的な操作なので、比較中は攻撃種類の積み上げを止める。
  const hasCompare = Boolean(compareStats);
  const stacked = !hasCompare;

  const breakdown = useMemo(
    () =>
      stacked
        ? createDamageDensityBreakdown(report.data, undefined, kind)
        : null,
    [report, stacked, kind],
  );

  // 凡例と棒には名前が要り、ツールチップには他所と同じ Chip を出すので種類も渡す。
  const breakdownItems = useMemo(
    () =>
      breakdown?.map((item): DamageBreakdownItem => {
        const key = item.key;
        const style = key === null ? null : report.data[key]?.style;

        return {
          key,
          label:
            key === null
              ? t("DamageDistribution.Other")
              : String(getAttackLabel(t, style)),
          style,
        };
      }),
    [breakdown, report, t],
  );

  const rows = useMemo(
    () =>
      stats
        ? createDamageChartRows({
            main: stats,
            mainScratchOnly: statsScratchOnly,
            compare: compareStats,
            compareScratchOnly: compareStatsScratchOnly,
            axisMain: statsAll,
            axisCompare: compareStatsAll,
            breakdown: breakdown ?? undefined,
            maxHp: targetMaxHp,
            currentHp: targetCurrentHp,
          })
        : [],
    [
      stats,
      statsScratchOnly,
      compareStats,
      compareStatsScratchOnly,
      statsAll,
      compareStatsAll,
      breakdown,
      targetMaxHp,
      targetCurrentHp,
    ],
  );

  // 同じ艦を複数積んでいると艦名だけでは区別できないので、編成順を添える。
  const shipOrders = useMemo(
    () =>
      comp && new Map(listCompShips(comp).map((ship) => [ship.id, ship.order])),
    [comp],
  );
  const nameOf = (id: string | undefined, name: string | undefined) =>
    withCompShipOrder(name, id ? shipOrders?.get(id) : undefined);

  // 重ねているときは、どちらも同じ「ダメージ発生確率」なので艦名で区別する。
  const probabilityLabel = t("DamageDistribution.Probability");
  const labelOf = (name: string | undefined) =>
    name ? `${probabilityLabel} (${name})` : probabilityLabel;

  const mainName = nameOf(attackerShipId, attackerShipName);
  const compareName = compareStats
    ? nameOf(compareShipId, compareShipName) || t("DamageDistribution.Compare")
    : undefined;

  const mainLabel = compareStats ? labelOf(mainName) : probabilityLabel;
  const compareLabel = compareStats ? labelOf(compareName) : undefined;

  return (
    <div className={className}>
      <Flexbox gap={2} flexWrap="wrap" mb={1}>
        {comp && onCompareShipChange && (
          <CompShipNameSelect
            label={t("DamageDistribution.Compare")}
            noneLabel={t("DamageDistribution.NoCompare")}
            comp={comp}
            excludeId={attackerShipId}
            value={compareShipId}
            onChange={onCompareShipChange}
          />
        )}

        {/* 割合ダメージを算入するか。外すと分布そのものから取り除くので、
            図に出る数値はすべて「貫通があった場合」のものになる。 */}
        <Checkbox
          size="small"
          label={t("DamageDistribution.Scratch")}
          checked={includeScratch}
          onChange={(checked) =>
            dispatch(appSlice.actions.setDamageDensityIncludeScratch(checked))
          }
        />
      </Flexbox>

      {stats ? (
        <>
          <DamageDensityChart
            rows={rows}
            stats={stats}
            targetMaxHp={targetMaxHp}
            targetCurrentHp={targetCurrentHp}
            breakdownItems={breakdownItems}
            mainLabel={mainLabel}
            compareLabel={compareLabel}
            mainName={mainName}
            compareName={compareName}
          />
          <DamageDensityStats
            stats={stats}
            targetMaxHp={targetMaxHp}
            targetCurrentHp={targetCurrentHp}
          />
        </>
      ) : (
        <Alert severity="warning">{t("Unknown")}</Alert>
      )}
    </div>
  );
};

export default styled(DamageDensitySection)`
  margin-top: 16px;
`;
