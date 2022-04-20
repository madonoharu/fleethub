import { GEAR_KEYS } from "@fh/utils";
import { Tooltip, TooltipProps, Typography } from "@mui/material";
import { Ship } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { getRangeAbbr, getSpeedRank } from "../../../utils";
import GearNameplate from "../GearNameplate";

const SHIP_STAT_KEYS = [
  "max_hp",
  "firepower",
  "armor",
  "torpedo",
  "evasion",
  "anti_air",
  "asw",
  "speed",
  "los",
  "range",
  "luck",
] as const;

const ShipTooltipContent: React.FCX<{ ship: Ship }> = ({ ship }) => {
  const { t, i18n } = useTranslation(["common", "ships"]);
  const isAbyssal = ship.is_abyssal();

  const renderRow = (key: typeof SHIP_STAT_KEYS[number]) => {
    let text: React.ReactNode;

    if (key === "speed") {
      const rank = getSpeedRank(ship.speed);
      text = rank ? t(`common:SpeedRank.${rank}`) : "?";
    } else if (key === "range") {
      const abbr = getRangeAbbr(ship.range);
      text = abbr ? t(`common:RangeAbbr.${abbr}`) : "?";
    } else {
      let left: number | undefined;
      let right: number | undefined;

      if (isAbyssal) {
        left = ship.get_naked_stat(key);
        right = ship[key];
      } else {
        left = ship.get_stat_interval_left(key);
        right = ship.get_stat_interval_right(key);
      }

      text = (
        <div css={{ display: "flex", gap: 8 }}>
          <span css={{ minWidth: 24 }}>{left ?? "?"}</span>
          <span css={{ minWidth: 24 }}>{right ?? "?"}</span>
        </div>
      );
    }

    return (
      <React.Fragment key={key}>
        <div>{t(`common:${key}`)}</div>
        <div>{text}</div>
      </React.Fragment>
    );
  };

  let displayName: string;
  if (i18n.resolvedLanguage === "ja") {
    displayName = ship.name;
  } else {
    displayName = t(`ships:${ship.ship_id}`, ship.name);
  }

  const slotSize = ship.slots
    .map((v) => (v == null ? "?" : v.toString()))
    .join(", ");

  return (
    <div>
      <Typography variant="subtitle2">{displayName}</Typography>

      <div
        css={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 8,
          lineHeight: 1,
          marginTop: 8,
          marginBottom: 8,
        }}
      >
        {SHIP_STAT_KEYS.map(renderRow)}
      </div>

      <div>
        {t("common:slots")} {slotSize}
      </div>

      {GEAR_KEYS.map((key) => {
        const gear = ship.get_gear(key);
        return (
          gear && (
            <GearNameplate key={key} iconId={gear.icon_id} name={gear.name} />
          )
        );
      })}
    </div>
  );
};

type ShipTooltipProps = Omit<TooltipProps, "title"> & {
  ship: Ship;
};

const ShipTooltip: React.FC<ShipTooltipProps> = ({ ship, children }) => {
  return (
    <Tooltip title={<ShipTooltipContent ship={ship} />}>{children}</Tooltip>
  );
};

export default ShipTooltip;
