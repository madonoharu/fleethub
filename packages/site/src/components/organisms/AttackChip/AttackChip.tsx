import { Chip } from "@mui/material";
import { styled, css } from "@mui/system";
import {
  DayBattleAttackType,
  DayCutin,
  NightBattleAttackType,
  NightCutin,
} from "fleethub-core";
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

const AttackChip: React.FCX<Props> = ({ className, type, cutin }) => {
  const { t } = useTranslation("common");

  let label: string;
  if (type === "Shelling") {
    if (cutin) {
      label = t(`DayCutin.${cutin as DayCutin}`);
    } else {
      label = t("WarfareType.Shelling");
    }
  } else if (type === "NightAttack") {
    if (cutin) {
      label = t(`NightCutin.${cutin as NightCutin}`);
    } else {
      label = t("Night");
    }
  } else if (type === "Torpedo") {
    label = t("WarfareType.Torpedo");
  } else if (type === "Asw") {
    label = t("WarfareType.AntiSub");
  } else {
    label = t("Unknown");
  }

  return (
    <Chip className={className} variant="outlined" size="small" label={label} />
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
