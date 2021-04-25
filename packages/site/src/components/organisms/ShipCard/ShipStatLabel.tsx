import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { BasicStatKey, ShipStats } from "@fleethub/core";
import React from "react";

import { StatIcon, Text } from "../../../components";
import { withSign } from "../../../utils";
import { Flexbox } from "../../atoms";
import ShipStatTooltip, { getValueStr, StatProps } from "./ShipStatTooltip";

const BonusText = styled(Text)(
  ({ theme }) => css`
    color: ${theme.colors.bonus};
    position: absolute;
    font-size: 10px;
    bottom: -3px;
    left: 10px;
  `
);
const DiffText = styled(Text)(
  ({ theme }) => css`
    color: ${theme.colors.diff};
    position: absolute;
    font-size: 10px;
    top: -3px;
    left: 10px;
  `
);

const ValueText = styled(Text)`
  margin-left: 4px;
  min-width: 24px;
  text-align: right;
  white-space: nowrap;
`;

type Props = StatProps<
  BasicStatKey | "maxHp" | "speed" | "range" | "luck" | "accuracy"
>;

const ShipStatLabel: React.FCX<Props> = (props) => {
  const { className, statKey, stat } = props;
  const valueStr = getValueStr(statKey, stat.value);
  let bonusStr: string | undefined;
  let diffStr: string | undefined;
  if ("bonus" in stat && stat.bonus !== 0 && !["speed"].includes(statKey)) {
    bonusStr = withSign(stat.bonus);
  }
  if ("diff" in stat && stat.diff !== 0) {
    diffStr = withSign(stat.diff);
  }

  return (
    <ShipStatTooltip {...props}>
      <Flexbox className={className}>
        <StatIcon icon={statKey} />
        <DiffText>{diffStr}</DiffText>
        <BonusText>{bonusStr}</BonusText>
        <ValueText>{valueStr}</ValueText>
      </Flexbox>
    </ShipStatTooltip>
  );
};

export default styled(ShipStatLabel)`
  position: relative;
  font-size: 0.75rem;
  line-height: 1.5;
` as typeof ShipStatLabel;
