import { useTheme } from "@mui/material/styles";

import { Chip, Typography } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React from "react";
import type { TooltipContentProps } from "recharts";

import type { DamageChartRow } from "../../../utils";
import { toPercent } from "../../../utils";
import { Flexbox } from "../../atoms";
// バレル経由だと react-dnd (ESM) まで引き込んでしまうので直接読む。
import AttackTypeChip from "../../molecules/AttackTypeChip";
import { cn } from "../../../styles";

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
const SeriesGrid = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    {...props}
    className={cn(
      "grid [grid-template-columns:auto_auto_auto_auto_auto_auto] gap-[0_6px] items-baseline whitespace-nowrap [&_.num]:text-right [&_.num]:[font-variant-numeric:tabular-nums]",
      className,
    )}
  />
);

/** 種類のない「その他」も、他の行と同じ枠と高さに揃える。 */
const OtherChip = ({ className, ...props }: React.ComponentProps<typeof Chip>) => (
  <Chip {...props} className={cn("rounded-[4px] min-w-0 border-unknown text-unknown", className)} />
);

interface Props extends Partial<TooltipContentProps<number, string>> {
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
    row.damage === row.damageEnd ? `${row.damage}` : `${row.damage} ~ ${row.damageEnd}`;

  const series = [
    {
      name: mainName,
      rate: row.rate,
      cumulative: row.cumulative,
      noPenetration: row.noPenetration,
    },
    {
      name: compareName,
      rate: row.compareRate,
      cumulative: row.compareCumulative,
      noPenetration: row.compareNoPenetration ?? 0,
    },
  ].filter((item) => item.rate !== null && item.cumulative !== null);

  return (
    <div className={className}>
      {/* 棒を単色にしたので、結果の損傷状態は数値そのものの色で示す。 */}
      <Typography
        className="font-bold"
        variant="inherit"
        component="div"
        style={{
          color: row.state ? theme.colors[`Damage${row.state}` as const] : undefined,
        }}
      >
        {t("Damage")} {damageText}
      </Typography>
      <SeriesGrid>
        {series.map((item, index) => (
          <React.Fragment key={index}>
            <span>{item.name}</span>
            <span className="num">{toPercent((item.rate ?? 0) - item.noPenetration, 2)}</span>
            <span>{item.noPenetration > 0 && `/ ${t("DamageDistribution.NoPenetration")}`}</span>
            <span className="num">
              {item.noPenetration > 0 && toPercent(item.noPenetration, 2)}
            </span>
            {/* 他のラベル付き数値と同じく、区切りは空白だけにする。 */}
            <span>/ {t("Cumulative")}</span>
            <span className="num">{toPercent(item.cumulative ?? 0)}</span>
          </React.Fragment>
        ))}
      </SeriesGrid>
      {breakdownItems?.map((item, index) => {
        const rate = row.breakdown[index];
        if (!rate) return null;

        return (
          // 種類名が重複しても壊れないよう添字を key にする。
          <Flexbox key={index} className="gap-1 mt-1">
            {item.style ? (
              <AttackTypeChip className="min-w-0" attack={item.style} />
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
export default ({ className, ...props }: React.ComponentProps<typeof DamageDensityTooltip>) => (
  <DamageDensityTooltip
    {...props}
    className={cn(
      "p-[4px_8px] rounded-[4px] text-[0.875rem] bg-[rgba(30,_20,_20,_0.85)] supports-[backdrop-filter:_blur(8px)]:[backdrop-filter:blur(8px)]",
      className,
    )}
  />
);
