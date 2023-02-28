import ErrorIcon from "@mui/icons-material/Error";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HealingIcon from "@mui/icons-material/Healing";
import { styled, css, SvgIconProps } from "@mui/material";
import { DamageState } from "fleethub-core";
import React from "react";

interface Props extends SvgIconProps {
  state: DamageState;
}

const DamageStateIcon: React.FC<Props> = ({ state, ...svgProps }) => {
  switch (state) {
    case "Normal":
      return <FavoriteIcon {...svgProps} aria-label="Normal" />;
    case "Shouha":
      return <FavoriteIcon {...svgProps} aria-label="Shouha" />;
    case "Chuuha":
      return <HealingIcon {...svgProps} aria-label="Chuuha" />;
    case "Taiha":
      return <HealingIcon {...svgProps} aria-label="Taiha" />;
    case "Sunk":
      return <ErrorIcon {...svgProps} aria-label="Sunk" />;
  }
};

export default styled(DamageStateIcon)(
  ({ state, theme }) => css`
    color: ${theme.colors[`Damage${state}` as const]};
  `
);
