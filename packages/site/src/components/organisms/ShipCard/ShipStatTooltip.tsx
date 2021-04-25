import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Tooltip, TooltipProps, Typography } from "@material-ui/core";
import React from "react";

import {
  getBonusText,
  getRangeName,
  getSpeedName,
  StatKeyDictionary,
  withSign,
} from "../../../utils";
import { Flexbox, Text } from "../../atoms";
import { StatIcon } from "../../molecules";

export const getValueStr = (key: string, value?: number) => {
  if (value === undefined) return "不明";

  if (key === "speed") return getSpeedName(value);
  if (key === "range") return getRangeName(value);
  return value.toString();
};

export type StatProps<K extends keyof ShipStats> = {
  statKey: K;
  stat: {
    diff?: number;
    equipment?: number;
    bonus?: number;
    naked?: number;
    value: number;
  };
};

type Props =
  | StatProps<BasicStatKey>
  | StatProps<"maxHp">
  | StatProps<"speed">
  | StatProps<"range">
  | StatProps<"luck">
  | StatProps<"accuracy">;

const StatTitle: React.FCX<{ statKey: Props["statKey"]; value: string }> = ({
  className,
  statKey,
  value,
}) => {
  const statNeme = StatKeyDictionary[statKey];
  return (
    <Flexbox className={className}>
      <StatIcon icon={statKey} />
      <Typography variant="subtitle2">
        <span>{statNeme}</span>
        {value}
      </Typography>
    </Flexbox>
  );
};

const SpaceBetween = styled(Flexbox)`
  justify-content: space-between;
`;

const StyledStatTitle = styled(StatTitle)(
  ({ theme, statKey }) => css`
    ${StatIcon} {
      vertical-align: sub;
    }

    span {
      margin: 0 4px;
      color: ${theme.colors[statKey]};
    }
  `
);

const ShipStatTooltip: React.FC<Props & Pick<TooltipProps, "children">> = ({
  statKey,
  stat,
  children,
}) => {
  const { value, bonus, diff, equipment } = stat;

  const title = (
    <>
      <StyledStatTitle statKey={statKey} value={getValueStr(statKey, value)} />

      {bonus ? (
        <SpaceBetween>
          <Text>装備ボーナス</Text>
          <Text color="bonus">{getBonusText(statKey, bonus)}</Text>
        </SpaceBetween>
      ) : null}
      {diff ? (
        <SpaceBetween>
          <Text>増加値</Text>
          <Text color="diff">{withSign(diff)}</Text>
        </SpaceBetween>
      ) : null}
      {equipment ? (
        <SpaceBetween>
          <Text>装備合計</Text>
          <Text>{withSign(equipment)}</Text>
        </SpaceBetween>
      ) : null}
    </>
  );

  return <Tooltip title={title}>{children}</Tooltip>;
};

export default ShipStatTooltip;
