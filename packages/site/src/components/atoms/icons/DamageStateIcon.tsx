import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { DamageState } from "@fleethub/core";
import { SvgIconProps } from "@material-ui/core";
import CircleIcon from "@material-ui/icons/Circle";
import ErrorIcon from "@material-ui/icons/Error";
import HealingIcon from "@material-ui/icons/Healing";
import React from "react";

const DamageStateIcon: React.FC<SvgIconProps & { state: DamageState }> = ({
  state,
  ...svgProps
}) => {
  switch (state) {
    case "Normal":
      return <CircleIcon {...svgProps} />;
    case "Shouha":
      return <CircleIcon {...svgProps} />;
    case "Chuuha":
      return <HealingIcon {...svgProps} />;
    case "Taiha":
      return <HealingIcon {...svgProps} />;
    case "Sunk":
      return <ErrorIcon {...svgProps} />;
  }
};

export default styled(DamageStateIcon)(
  ({ state, theme }) => css`
    color: ${theme.colors[`Damage${state}` as const]};
  `
);
