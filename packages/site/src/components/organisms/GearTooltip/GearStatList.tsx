import { nonNullable } from "@fh/utils";
import { css, styled, Typography } from "@mui/material";
import type { EBonuses, Gear } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { getRangeAbbr, withSign } from "../../../utils";
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

const Value = styled("span")`
  text-align: right;
  margin-left: 8px;
`;

const Bonus = styled(Value)(
  ({ theme }) => css`
    color: ${theme.colors.bonus};
  `
);

export type Props = {
  gear: Gear;
  ebonuses?: EBonuses;
};

const GearStatList: React.FCX<Props> = ({ className, gear, ebonuses }) => {
  const { t } = useTranslation("common");

  const isLbFighter = gear.gear_type == "LbFighter";

  const data = STAT_KEYS.map((key) => {
    if (isLbFighter && (key === "accuracy" || key === "evasion")) {
      return;
    }

    const value = gear[key];
    const bonusValue = ebonuses?.[key as keyof EBonuses] || 0;

    if (!value && !bonusValue) {
      return;
    }

    const bonus = bonusValue ? withSign(bonusValue) : "";

    if (key === "range") {
      const addr = getRangeAbbr(value);
      const text = addr ? t(`RangeAbbr.${addr}`) : "?";
      return { key, value: text, bonus };
    }

    if (key === "speed") {
      return { key, value: "", bonus };
    }

    return { key, value, bonus };
  }).filter(nonNullable);

  return (
    <Typography className={className} variant="body2" component="div">
      {data.map((datum) => (
        <React.Fragment key={datum.key}>
          <StatLabel statKey={datum.key} />
          <Value>{datum.value}</Value>
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
