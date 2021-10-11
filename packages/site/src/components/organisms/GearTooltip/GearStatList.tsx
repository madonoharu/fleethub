import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Gear } from "@fh/core";
import { nonNullable } from "@fh/utils";
import { Typography } from "@mui/material";
import { EquipmentBonuses } from "equipment-bonus";
import { useTranslation } from "next-i18next";
import React from "react";

import { getRangeLabel, withSign } from "../../../utils";
import { StatIcon } from "../../molecules";

const STAT_KEYS = [
  "firepower",
  "torpedo",
  "anti_air",
  "asw",
  "bombing",
  "accuracy",
  "evasion",
  "interception",
  "anti_bomber",
  "los",
  "armor",
  "speed",
  "range",
  "radius",
] as const;

type StatKey = typeof STAT_KEYS[number];

type StatEntry = {
  key: StatKey;
  value: number | string;
  bonus?: number | string;
};

const StatLabel: React.FCX<{ statKey: StatKey }> = ({ className, statKey }) => {
  const { t } = useTranslation("common");
  return (
    <div
      className={className}
      css={css`
        display: flex;
        align-items: center;
      `}
    >
      <StatIcon icon={statKey} />
      <span css={{ marginLeft: 8 }}>{t(statKey)}</span>
    </div>
  );
};

const Value = styled.span`
  text-align: right;
  margin-left: 8px;
`;

const Bonus = styled(Value)(
  ({ theme }) => css`
    color: ${theme.colors.bonus};
  `
);

export const toStatEntries = (gear: Gear, ebonuses?: EquipmentBonuses) => {
  const isLbFighter = gear.gear_type == "LbFighter";

  return STAT_KEYS.map((key): StatEntry | undefined => {
    if (isLbFighter && (key === "accuracy" || key === "evasion")) {
      return;
    }

    const value = gear[key];

    let bonus = "";
    if (
      ebonuses &&
      key !== "interception" &&
      key !== "anti_bomber" &&
      key !== "radius" &&
      key !== "speed"
    ) {
      bonus = withSign(ebonuses[key]);
    }

    if (!value && !bonus) return;

    if (key === "range") return { key, value: getRangeLabel(value), bonus };
    if (key === "speed") return { key, value: "", bonus };
    return { key, value, bonus };
  }).filter(nonNullable);
};

export type Props = {
  gear: Gear;
  ebonuses?: EquipmentBonuses;
};

const GearStatList: React.FCX<Props> = ({ className, gear, ebonuses }) => {
  const { t } = useTranslation("common");
  const data = toStatEntries(gear, ebonuses);

  return (
    <Typography className={className} variant="body2" component="div">
      {data.map((datum) => (
        <React.Fragment key={datum.key}>
          <StatLabel statKey={datum.key} />
          <Value>
            {datum.key === "range" ? t(`${datum.value}`) : datum.value}
          </Value>
          <Bonus>{datum.bonus}</Bonus>
        </React.Fragment>
      ))}
    </Typography>
  );
};

export default styled(GearStatList)`
  display: grid;
  grid-gap: 4px;
  grid-template-columns: max-content min-content min-content;
`;
