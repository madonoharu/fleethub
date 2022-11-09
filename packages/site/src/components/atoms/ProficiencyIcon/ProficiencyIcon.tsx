import styled from "@emotion/styled";
import { expToAce } from "@fh/utils";
import { Typography } from "@mui/material";
import Image from "next/image";
import React from "react";

const ExpLabel = styled(Typography)`
  position: absolute;
  font-size: 10px;
  bottom: 0;
  right: 0;
  line-height: 1;
  background: rgba(128, 64, 64, 0.6);
  border-radius: 2px;
`;

interface ProficiencyIconProps extends React.ComponentProps<"div"> {
  exp: number;
}

const ProficiencyIcon = React.forwardRef<HTMLDivElement, ProficiencyIconProps>(
  (props, ref) => {
    const { exp, ...rest } = props;
    const ace = expToAce(exp);

    return (
      <div ref={ref} {...rest}>
        <Image
          height={24}
          width={18}
          src={`/icons/ace${ace}.png`}
          alt={`ace${ace}`}
        />
        <ExpLabel aria-label="exp">{exp}</ExpLabel>
      </div>
    );
  }
);

export default styled(ProficiencyIcon)`
  height: 24px;
  filter: brightness(110%) contrast(110%) saturate(100%);
`;
