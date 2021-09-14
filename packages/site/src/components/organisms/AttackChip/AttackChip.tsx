import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { DayBattleAttackType, NightBattleAttackType } from "@fh/core";
import { Chip } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

type AttackChipType =
  | DayBattleAttackType["t"]
  | NightBattleAttackType["t"]
  | "Torpedo";

type Props = {
  type: AttackChipType;
  cutin?: string | null | undefined;
};

const AttackChip: React.FCX<Props> = ({ className, type, cutin }) => {
  const { t } = useTranslation("common");
  return (
    <Chip
      className={className}
      variant="outlined"
      size="small"
      label={t(cutin || type)}
    />
  );
};

export default styled(AttackChip)(({ theme, type }) => {
  const color = theme.colors[type];
  const minWidth = type === "NightAttack" ? 72 : 48;

  return css`
    border-radius: 4px;
    min-width: ${minWidth}px;
    border-color: ${color};
    color: ${color};
  `;
});
