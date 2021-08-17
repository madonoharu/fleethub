import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Chip } from "@material-ui/core";
import { useTranslation } from "next-i18next";
import React from "react";

type Props = {
  night?: boolean;
  attack: string;
};

const AttackChip: React.FCX<Props> = ({ className, attack }) => {
  const { t } = useTranslation("common");
  return (
    <Chip
      className={className}
      variant="outlined"
      size="small"
      label={t(attack)}
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
