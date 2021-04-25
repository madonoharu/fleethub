import styled from "@emotion/styled";
import { Typography } from "@material-ui/core";
import Image from "next/image";
import React from "react";

export const GEAR_EXP_TABLE = [0, 10, 25, 40, 55, 70, 85, 100, 120];

const expToAce = (exp: number) =>
  Math.min(
    GEAR_EXP_TABLE.findIndex((bound) => bound >= exp),
    7
  );

const Exp = styled(Typography)`
  position: absolute;
  font-size: 10px;
  bottom: 0;
  right: 0;
  line-height: 1;
  background: rgba(128, 64, 64, 0.6);
  border-radius: 2px;
`;

type ProficiencyIconProps = Pick<
  React.ComponentProps<"div">,
  "className" | "onClick"
> & {
  exp: number;
};

const ProficiencyIcon = React.forwardRef<HTMLDivElement, ProficiencyIconProps>(
  (props, ref) => {
    const { exp, ...divProps } = props;
    const ace = expToAce(exp);

    return (
      <div ref={ref} {...divProps}>
        <Image height={24} width={18} src={`/proficiency/${ace}.png`} />
        <Exp>{exp}</Exp>
      </div>
    );
  }
);

export default styled(ProficiencyIcon)`
  height: 24px;
  filter: brightness(110%) contrast(110%) saturate(100%);
`;
