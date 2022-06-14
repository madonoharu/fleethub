import ConnectingAirportsIcon from "@mui/icons-material/ConnectingAirports";
import { styled } from "@mui/system";
import { Ship } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { getRangeAbbr, getSpeedRank } from "../../../utils";
import { StatIcon } from "../../molecules";

import StatChip from "./StatChip";

const SHIP_STAT_KEYS = [
  "max_hp",
  "firepower",
  "armor",
  "torpedo",
  "evasion",
  "anti_air",
  "fighter_power",
  "asw",
  "speed",
  "los",
  "range",
  "luck",
] as const;

interface Props {
  ship: Ship;
}

const MasterShipStats: React.FCX<Props> = ({ className, ship }) => {
  const { t } = useTranslation("common");
  const abyssal = ship.is_abyssal();

  return (
    <div className={className}>
      {SHIP_STAT_KEYS.map((key) => {
        if (key === "fighter_power") {
          return (
            <StatChip
              key={key}
              icon={<ConnectingAirportsIcon fontSize="inherit" />}
              left={t("FighterPower")}
              right={ship.fighter_power("Carrier")}
            />
          );
        } else if (key === "speed") {
          const rank = getSpeedRank(ship.speed);
          const text = rank ? t(`SpeedRank.${rank}`) : "?";

          return (
            <StatChip key={key} icon={<StatIcon icon={key} />} left={text} />
          );
        } else if (key === "range") {
          const abbr = getRangeAbbr(ship.range);
          const text = abbr ? t(`RangeAbbr.${abbr}`) : "?";

          return (
            <StatChip key={key} icon={<StatIcon icon={key} />} left={text} />
          );
        }

        if (abyssal) {
          const naked = ship.get_naked_stat(key) ?? "?";
          const stat = ship[key] ?? "?";

          return (
            <StatChip
              key={key}
              icon={<StatIcon icon={key} />}
              left={naked}
              right={naked === stat ? undefined : stat}
            />
          );
        } else {
          const left = ship.get_stat_interval_left(key) ?? "?";
          const right = ship.get_stat_interval_right(key) ?? "?";
          return (
            <StatChip
              key={key}
              icon={<StatIcon icon={key} />}
              left={left}
              right={right}
            />
          );
        }
      })}
    </div>
  );
};

export default styled(MasterShipStats)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-size: 0.75rem;
  gap: 4px;
`;
