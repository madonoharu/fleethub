import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { AirState } from "@fleethub/core";
import { Tooltip, Typography } from "@material-ui/core";
import React from "react";

const FighterPowerValue: React.FCX<{ airState: AirState; value: number }> = ({
  className,
  airState,
  value,
}) => {
  return (
    <Tooltip title={airState}>
      <span className={className}>{value}</span>
    </Tooltip>
  );
};

const StyledFighterPowerValue = styled(FighterPowerValue)(
  ({ theme, airState }) => css`
    color: ${theme.colors[airState]};
  `
);

const getMinFighterPowers = (fp: number) => {
  return {
    AirSupremacy: Math.ceil(3 * fp),
    AirSuperiority: Math.ceil(1.5 * fp),
    AirParity: Math.floor((2 / 3) * fp) + 1,
    AirDenial: Math.floor((1 / 3) * fp) + 1,
  };
};

type Props = {
  fp: [number, number, number, number];
  label?: string;
};

const FighterPowerStats: React.FCX<Props> = ({ className, fp, label }) => {
  return (
    <Typography className={className} component="div">
      {label && <span>{label}</span>}
      <span>(</span>
      <StyledFighterPowerValue airState={"AirSupremacy"} value={fp[3]} />
      <span>/</span>
      <StyledFighterPowerValue airState={"AirSuperiority"} value={fp[2]} />
      <span>/</span>
      <StyledFighterPowerValue airState={"AirParity"} value={fp[1]} />
      <span>/</span>
      <StyledFighterPowerValue airState={"AirDenial"} value={fp[0]} />
      <span>)</span>
    </Typography>
  );
};

export default styled(FighterPowerStats)`
  > span {
    margin: 2px;
  }
`;
