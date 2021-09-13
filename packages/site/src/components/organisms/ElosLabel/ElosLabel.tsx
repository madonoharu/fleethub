import styled from "@emotion/styled";
import { Typography, Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { StatIcon } from "../../molecules";

const FactorValue = styled.span`
  position: relative;
  bottom: -4px;
  left: -2px;
  font-size: 0.75rem;
`;

const ElosLabel: React.FCX<{ elos: number | undefined; factor: number }> = ({
  className,
  style,
  elos,
  factor,
}) => {
  const { t } = useTranslation("common");

  return (
    <Tooltip title={`${t("ElosNodeFactor")}${factor}`}>
      <Typography
        className={className}
        style={style}
        variant="body2"
        component="div"
      >
        <StatIcon icon="los" />
        <FactorValue>{factor}</FactorValue>
        <span>{elos?.toFixed(2) ?? "?"}</span>
      </Typography>
    </Tooltip>
  );
};

export default styled(ElosLabel)`
  display: flex;
  align-items: center;
`;
