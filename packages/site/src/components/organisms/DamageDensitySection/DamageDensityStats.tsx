import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import type { DamageState } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import type { DamageDensityStats as Stats } from "../../../utils";
import { getRequiredDamage, getTailRate, toPercent } from "../../../utils";
import { Flexbox, LabeledValue } from "../../atoms";

const PRESETS: DamageState[] = ["Shouha", "Chuuha", "Taiha", "Sunk"];

/** 上の分布バーの凡例と同じ見た目にして、どの損傷状態の話か一目で分かるようにする。 */
const Dot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
`;

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
      <Typography
        className={className}
        variant="caption"
        color="text.secondary"
      >
        {t("Unknown")}
      </Typography>
    );
  }

  // 上の分布バーが「ちょうどその損傷状態になる確率」なのに対し、こちらは
  // 「その損傷状態以上になる確率」。撃沈がそのまま撃破率にあたる。
  return (
    <Flexbox className={className} gap={2} flexWrap="wrap">
      {PRESETS.map((state) => (
        <LabeledValue
          key={state}
          label={
            <Flexbox gap={0.5}>
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
            getTailRate(
              stats,
              getRequiredDamage(state, targetMaxHp, targetCurrentHp),
            ),
          )}
        />
      ))}
    </Flexbox>
  );
};

export default styled(DamageDensityStats)`
  margin-top: 8px;
`;
