/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Chip } from "@mui/material";
import { DayBattleAttackType, NightBattleAttackType } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

type WarfareType =
  | DayBattleAttackType["t"]
  | NightBattleAttackType["t"]
  | "Torpedo";

type Props = {
  type: WarfareType;
  cutin?: string | null | undefined;
};

const getLabel = (type: WarfareType, cutin: string | null | undefined) => {
  if (cutin) return cutin;

  if (type === "NightAttack") return "Night";
  if (type === "Shelling") return "AttackTypeSingleAttack";
  if (type === "Torpedo") return "AttackTypeTorpedo";
  if (type === "Asw") return "WarfareAntiSub";
  return "Unknown";
};

const AttackChip: React.FCX<Props> = ({ className, type, cutin }) => {
  const { t } = useTranslation("common");
  return (
    <Chip
      className={className}
      variant="outlined"
      size="small"
      label={t(getLabel(type, cutin))}
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
