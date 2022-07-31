import { includes } from "@fh/utils";
import { Chip, styled, css } from "@mui/material";
import type { DayCutin, NightCutin } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

export type AttackTypeTag = "Shelling" | "Night" | "Asw" | "Torpedo";

interface Props {
  type: AttackTypeTag | null;
  cutin: unknown;
}

const FLEET_CUTINS = [
  "NelsonTouch",
  "NagatoClassCutin",
  "ColoradoClassCutin",
  "KongouClassCutin",
  "Yamato2ShipCutin",
  "Yamato3ShipCutin",
] as const;

const AttackTypeChip: React.FCX<Props> = ({ className, type, cutin }) => {
  const { t } = useTranslation("common");

  let label: string;

  if (type) {
    label = t(`AttackType.${type}`);
  } else {
    label = t("Unknown");
  }

  if (typeof cutin === "string") {
    if (includes(FLEET_CUTINS, cutin)) {
      label = t(`FleetCutin.${cutin}`, "Unknown");
    } else if (type === "Shelling") {
      label = t(`DayCutin.${cutin as DayCutin}`, "Unknown");
    } else if (type === "Night") {
      label = t(`NightCutin.${cutin as NightCutin}`, "Unknown");
    }
  }

  return (
    <Chip className={className} variant="outlined" size="small" label={label} />
  );
};

export default styled(AttackTypeChip)(({ theme, type }) => {
  const color = theme.colors[type || "Unknown"];
  const minWidth = type === "Night" ? 72 : 48;

  return css`
    border-radius: 4px;
    min-width: ${minWidth}px;
    border-color: ${color};
    color: ${color};
  `;
});
