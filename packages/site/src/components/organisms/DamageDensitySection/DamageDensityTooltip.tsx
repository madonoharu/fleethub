import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Chip, Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";
import type { TooltipProps } from "recharts";

import type { DamageChartRow } from "../../../utils";
import { toPercent } from "../../../utils";
import { Flexbox } from "../../atoms";
// バレル経由だと react-dnd (ESM) まで引き込んでしまうので直接読む。
import AttackTypeChip from "../../molecules/AttackTypeChip";

export interface DamageBreakdownItem {
  /**
   * `report.data` のキー。まとめた「その他」は null。
   *
   * 凡例の on/off はこれで覚える。段の並びは発動率で決まるので、装備を変えて
   * 順序が入れ替わると、添字で覚えていては別の種類が消えたままになる。
   */
  key: string | null;
  label: string;
  /** 攻撃種類。他所と同じ Chip で出す。「その他」は種類が無いので null。 */
  style: unknown;
}

/**
 * 系列の行。艦名の長さが揃わないので、桁を列で合わせる。
 *
 * 空のセルも必ず置くこと。1行あたりの列数がずれると次の行の頭が
 * 先頭列から始まらなくなる。
 */
const SeriesGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto auto auto;
  gap: 0 6px;
  align-items: baseline;
  white-space: nowrap;

  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
`;

/** 種類のない「その他」も、他の行と同じ枠と高さに揃える。 */
const OtherChip = styled(Chip)`
  border-radius: 4px;
  min-width: 72px;
  border-color: ${({ theme }) => theme.colors.Unknown};
  color: ${({ theme }) => theme.colors.Unknown};
`;

interface Props extends TooltipProps<number, string> {
  /** 系列の見出し。全系列が「ダメージ発生確率」なので、艦名だけを出す。 */
  mainName?: string | undefined;
  compareName?: string | undefined;
  /** 積み上げ表示のときの系列。`row.breakdown` と同じ順。 */
  breakdownItems?: DamageBreakdownItem[] | undefined;
}

const DamageDensityTooltip: React.FCX<Props> = ({
  className,
  active,
  payload,
  mainName,
  compareName,
  breakdownItems,
}) => {
  const { t } = useTranslation("common");
  const theme = useTheme();

  if (!active) return null;

  const row = payload?.[0]?.payload as DamageChartRow | undefined;
  if (!row) return null;

  const damageText =
    row.damage === row.damageEnd
      ? `${row.damage}`
      : `${row.damage} ~ ${row.damageEnd}`;

  const series = [
    {
      name: mainName,
      rate: row.rate,
      cumulative: row.cumulative,
      /** `rate` のうち割合ダメージのぶん。棒の塗り分けに対応する。 */
      scratch: row.scratch,
    },
    {
      name: compareName,
      rate: row.compareRate,
      cumulative: row.compareCumulative,
      scratch: row.compareScratch ?? 0,
    },
  ].filter((item) => item.rate !== null && item.cumulative !== null);

  return (
    <div className={className}>
      {/* 棒を単色にしたので、結果の損傷状態は数値そのものの色で示す。 */}
      <Typography
        variant="inherit"
        component="div"
        fontWeight="bold"
        style={{
          color: row.state
            ? theme.colors[`Damage${row.state}` as const]
            : undefined,
        }}
      >
        {t("Damage")} {damageText}
      </Typography>
      <SeriesGrid>
        {series.map((item, index) => (
          <React.Fragment key={index}>
            <span>{item.name}</span>
            {/* 装甲貫通のぶんと割合のぶんに分けて出す。
                足したものがそのダメージ量の発生確率。 */}
            <span className="num">
              {toPercent((item.rate ?? 0) - item.scratch, 2)}
            </span>
            <span>
              {item.scratch > 0 && `/ ${t("DamageDistribution.Scratch")}`}
            </span>
            <span className="num">
              {item.scratch > 0 && toPercent(item.scratch, 2)}
            </span>
            {/* 他のラベル付き数値と同じく、区切りは空白だけにする。 */}
            <span>/ {t("Cumulative")}</span>
            <span className="num">{toPercent(item.cumulative ?? 0)}</span>
          </React.Fragment>
        ))}
      </SeriesGrid>
      {/* 積み上げているときは、その棒を作っている種類の内訳も出す。 */}
      {breakdownItems?.map((item, index) => {
        const rate = row.breakdown[index];
        if (!rate) return null;

        return (
          // 種類名が重複しても壊れないよう添字を key にする。
          <Flexbox key={index} gap={0.5} mt={0.5}>
            {item.style ? (
              <AttackTypeChip attack={item.style} />
            ) : (
              <OtherChip variant="outlined" size="small" label={item.label} />
            )}
            <Typography variant="inherit" component="span">
              {toPercent(rate, 2)}
            </Typography>
          </Flexbox>
        );
      })}
    </div>
  );
};

/** MuiTooltip の styleOverrides と同じ見た目にする。 */
export default styled(DamageDensityTooltip)`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  background: rgba(30, 20, 20, 0.85);

  @supports (backdrop-filter: blur(8px)) {
    backdrop-filter: blur(8px);
  }
`;
