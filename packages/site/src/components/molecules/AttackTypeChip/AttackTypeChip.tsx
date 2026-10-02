import { cn } from "../../../styles/cn";
import { colors } from "../../../styles/colors";
import { includes, isUnknownRecord } from "@fh/utils";
import { Chip } from "@mui/material";
import type {
  AswAttackStyle,
  NightAttackStyle,
  ShellingStyle,
  SupportShellingStyle,
  TorpedoAttackStyle,
} from "fleethub-core";
import { TFunction } from "i18next";
import { useTranslation } from "next-i18next/pages";
import React from "react";

type Tag =
  | ShellingStyle["tag"]
  | NightAttackStyle["tag"]
  | AswAttackStyle["tag"]
  | TorpedoAttackStyle["tag"]
  | SupportShellingStyle["tag"];

interface UnknownAttackStyle {
  tag: Tag;
  cutin?: string | null;
}

function isUnknownAttackStyle(value: unknown): value is UnknownAttackStyle {
  return isUnknownRecord(value) && typeof value.tag === "string";
}

function isShellingStyle(attack: UnknownAttackStyle): attack is ShellingStyle {
  return attack.tag === "ShellingStyle";
}

function isNightAttackStyle(attack: UnknownAttackStyle): attack is NightAttackStyle {
  return attack.tag === "NightAttackStyle";
}

export function getAttackLabel(t: TFunction<"common">, attack: unknown) {
  if (!isUnknownAttackStyle(attack)) {
    return t("Unknown");
  }

  const tag = attack.tag;
  if (tag === "TorpedoAttackStyle") {
    return t("AttackType.Torpedo");
  }
  if (tag === "AswAttackStyle") {
    return t("AttackType.Asw");
  }
  if (tag === "SupportShellingStyle") {
    return t("Support");
  }

  if (isShellingStyle(attack)) {
    const { cutin, attack_type } = attack;

    if (!cutin) {
      return t(`ShellingType.${attack_type}`);
    } else if (includes(FLEET_CUTINS, cutin)) {
      return t(`FleetCutin.${cutin}`);
    } else {
      return t(`DayCutin.${cutin}`);
    }
  }

  if (isNightAttackStyle(attack)) {
    const { cutin, attack_type } = attack;

    if (!cutin) {
      return t(`NightAttackType.${attack_type}`);
    } else if (includes(FLEET_CUTINS, cutin)) {
      return t(`FleetCutin.${cutin}`);
    } else {
      return t(`NightCutin.${cutin}`);
    }
  }

  return t("Unknown");
}

interface Props {
  className?: string;
  attack: unknown;
}

const FLEET_CUTINS = [
  "NelsonTouch",
  "NagatoClassCutin",
  "ColoradoClassCutin",
  "KongouClassCutin",
  "QueenElizabethClassCutin",
  "RichelieuClassCutin",
  "Yamato2ShipCutin",
  "Yamato3ShipCutin",
] as const;

const AttackTypeChip = React.forwardRef<HTMLDivElement, Props>(
  ({ attack, className, ...rest }, ref) => {
    const { t } = useTranslation("common");

    const label = getAttackLabel(t, attack);
    const color = colors[getColorKey(attack) || "Unknown"];

    return (
      <Chip
        ref={ref}
        variant="outlined"
        size="small"
        label={label}
        {...rest}
        className={cn("rounded-sm min-w-18", className)}
        style={{ color, borderColor: color }}
      />
    );
  },
);

type AttackColorKey = "Shelling" | "Night" | "Asw" | "Torpedo";

function getColorKey(value: unknown): AttackColorKey | null {
  if (!isUnknownAttackStyle(value)) {
    return null;
  }

  switch (value.tag) {
    case "ShellingStyle":
    case "SupportShellingStyle":
      return "Shelling";
    case "NightAttackStyle":
      return "Night";
    case "AswAttackStyle":
      return "Asw";
    case "TorpedoAttackStyle":
      return "Torpedo";
    default:
      return null;
  }
}

export default AttackTypeChip;
