import { Palette } from "@mui/material";
import { css, styled } from "@mui/system";
import React from "react";

const StatValue = styled("div")`
  text-align: right;
`;

interface Props {
  icon?: React.ReactElement;
  right?: React.ReactElement | string | number;
  left?: React.ReactElement | string | number;
}

const StatChip: React.FCX<Props> = ({ className, icon, left, right }) => {
  return (
    <div className={className}>
      <div css={{ display: "flex", alignItems: "center", fontSize: 15 }}>
        {icon}
      </div>
      <StatValue>{left}</StatValue>
      <StatValue>{right}</StatValue>
    </div>
  );
};

export default styled(StatChip)(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: 15px 1fr 1fr;
    gap: 8px;
    padding: 0 4px;
    border: 1px solid ${(theme.palette as Palette).action.selected};
    border-radius: 4px;
  `
);
