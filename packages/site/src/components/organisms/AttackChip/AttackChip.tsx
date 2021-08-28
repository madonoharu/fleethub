import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Chip } from "@material-ui/core";
import { useTranslation } from "next-i18next";
import React from "react";

type Props = {
  night?: boolean;
  attack?: string | null | undefined;
};

const AttackChip: React.FCX<Props> = ({ className, attack }) => {
  const { t } = useTranslation("common");
  return (
    <Chip
      className={className}
      variant="outlined"
      size="small"
      label={t(attack || "None")}
    />
  );
};

export default styled(AttackChip)(({ theme, attack, night }) => {
  const type = night ? "night" : "shelling";
  const color = attack ? theme.colors[type] : theme.palette.text.secondary;
  const minWidth = night ? 72 : 48;

  return css`
    border-radius: 4px;
    min-width: ${minWidth}px;
    border-color: ${color};
    color: ${color};
  `;
});
