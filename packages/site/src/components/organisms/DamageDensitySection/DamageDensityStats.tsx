import { useTheme } from "@mui/material/styles";

import { Typography } from "@mui/material";
import type { DamageState } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import type { DamageDensityStats as Stats } from "../../../utils";
import { getRequiredDamage, getTailRate, toPercent } from "../../../utils";
import { Flexbox, LabeledValue } from "../../atoms";
import { cn } from "../../../styles";

const PRESETS: DamageState[] = ["Shouha", "Chuuha", "Taiha", "Sunk"];

/** 上の分布バーの凡例と同じ見た目にして、どの損傷状態の話か一目で分かるようにする。 */
const Dot = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span {...props} className={cn("w-3 h-3 rounded-[50%] shrink-0", className)} />
);

interface Props {
  stats: Stats;
  targetMaxHp: number | undefined;
  targetCurrentHp: number | undefined;
}

const DamageDensityStats: React.FCX<Props> = ({
  className,
  stats,
  targetMaxHp,
  targetCurrentHp,
}) => {
  const { t } = useTranslation("common");
  const theme = useTheme();

  if (targetMaxHp === undefined || targetCurrentHp === undefined) {
    return (
      <Typography className={cn("text-text-secondary", className)} variant="caption">
        {t("Unknown")}
      </Typography>
    );
  }

  // 上の分布バーが「ちょうどその損傷状態になる確率」なのに対し、こちらは
  // 「その損傷状態以上になる確率」。撃沈がそのまま撃破率にあたる。
  return (
    <Flexbox className={cn("gap-4 flex-wrap", className)}>
      {PRESETS.map((state) => (
        <LabeledValue
          key={state}
          label={
            <Flexbox className="gap-1">
              <Dot
                style={{
                  background: theme.colors[`Damage${state}` as const],
                }}
              />
              {`${t(`DamageState.${state}`)}${
                state === "Sunk" ? "" : t("DamageDistribution.OrMore")
              }`}
            </Flexbox>
          }
          value={toPercent(
            getTailRate(stats, getRequiredDamage(state, targetMaxHp, targetCurrentHp)),
          )}
        />
      ))}
    </Flexbox>
  );
};

export default ({ className, ...props }: React.ComponentProps<typeof DamageDensityStats>) => (
  <DamageDensityStats {...props} className={cn("mt-2", className)} />
);
