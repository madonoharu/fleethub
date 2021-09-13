import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { DamageState } from "@fleethub/core";
import ErrorIcon from "@mui/icons-material/Error";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HealingIcon from "@mui/icons-material/Healing";
import { SvgIconProps } from "@mui/material";
import React from "react";

const DamageStateIcon: React.FC<SvgIconProps & { state: DamageState }> = ({
  state,
  ...svgProps
}) => {
  switch (state) {
    case "Normal":
      return <FavoriteIcon {...svgProps} />;
    case "Shouha":
      return <FavoriteIcon {...svgProps} />;
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
