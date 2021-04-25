import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { DayCutin, NightSpecialAttack } from "@fleethub/core";
import { Chip } from "@material-ui/core";
import React from "react";

type Props = {
  night?: boolean;
  attack: DayCutin | NightSpecialAttack;
};

const AttackChip: React.FCX<Props> = ({ className, attack }) => {
  return (
    <Chip
      className={className}
      variant="outlined"
      size="small"
      label={attack.name}
    />
  );
};

export default styled(AttackChip)(({ theme, night }) => {
  const type = night ? "night" : "shelling";
  const minWidth = night ? 72 : 48;

  return css`
    border-radius: 4px;
    min-width: ${minWidth}px;
    border-color: ${theme.colors[type]};
    color: ${theme.colors[type]};
  `;
});
