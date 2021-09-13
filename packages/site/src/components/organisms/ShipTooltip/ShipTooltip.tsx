import { Ship } from "@fleethub/core";
import { GEAR_KEYS } from "@fleethub/utils";
import { Tooltip, TooltipProps } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";
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

type ShipTooltipProps = Omit<TooltipProps, "title"> & {
  ship: Ship;
};

const ShipTooltip: React.FC<ShipTooltipProps> = ({ ship, children }) => {
  const { t } = useTranslation(["ships", "common"]);
  return (
    <Tooltip
      title={
        <div>
          {t(`ships:${ship.ship_id}`, ship.name)}
          {SHIP_STAT_KEYS.map((key) => (
            <div key={key}>
              {t(`common:${key}`)} {ship.get_naked_stat(key)},{ship[key]}
            </div>
          ))}

          {GEAR_KEYS.map((key) => {
            const gear = ship.get_gear(key);
            return (
              gear && (
                <GearNameplate
                  key={key}
                  iconId={gear.icon_id}
                  name={gear.name}
                />
              )
            );
          })}
        </div>
      }
    >
      {children}
    </Tooltip>
  );
};

export default ShipTooltip;
