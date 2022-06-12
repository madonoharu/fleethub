import { styled } from "@mui/system";
import { Ship } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { getRangeAbbr, getSpeedRank } from "../../../utils";
import { Flexbox } from "../../atoms";
import { StatIcon } from "../../molecules";

const StatValue = styled("span")`
  text-align: right;
  min-width: 20px;
`;

const Center = styled("span")`
  text-align: center;
  width: 100%;
`;

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
            <Flexbox key={key} gap={1}>
              <span css={{ flexShrink: 0 }}>{t("FighterPower")}</span>
              <Center>{ship.fighter_power("Carrier")}</Center>
            </Flexbox>
          );
        } else if (key === "speed") {
          const rank = getSpeedRank(ship.speed);
          const text = rank ? t(`SpeedRank.${rank}`) : "?";

          return (
            <Flexbox key={key}>
              <div css={{ flexShrink: 0 }}>
                <StatIcon icon={key} />
              </div>
              <Center>{text}</Center>
            </Flexbox>
          );
        } else if (key === "range") {
          const abbr = getRangeAbbr(ship.range);
          const text = abbr ? t(`RangeAbbr.${abbr}`) : "?";

          return (
            <Flexbox key={key}>
              <div css={{ flexShrink: 0 }}>
                <StatIcon icon={key} />
              </div>
              <Center>{text}</Center>
            </Flexbox>
          );
        }

        if (abyssal) {
          const naked = ship.get_naked_stat(key);
          const stat = ship[key];

          return (
            <Flexbox key={key} gap={1}>
              <StatIcon icon={key} />
              <StatValue>{naked}</StatValue>
              <StatValue>{stat}</StatValue>
            </Flexbox>
          );
        } else {
          const left = ship.get_stat_interval_left(key);
          const right = ship.get_stat_interval_right(key);
          return (
            <Flexbox key={key} gap={1}>
              <StatIcon icon={key} />
              <StatValue>{left}</StatValue>
              <StatValue>{right}</StatValue>
            </Flexbox>
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
  gap: 0 8px;
`;
