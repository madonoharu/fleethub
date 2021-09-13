import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { getNodeTypeStyle } from "../../../styles";

type NodeLableProps = {
  name: string;
  type: number;
  d?: number;
};

const NodeLable: React.FCX<NodeLableProps> = ({
  className,
  style,
  name,
  type,
  d,
}) => {
  const { t } = useTranslation("common");
  const distance = d && `${t("LbasDistance")}: ${d}`;

  return (
    <Typography className={className} style={style} variant="subtitle2">
      <span>{name}</span>
      <span>{t(getNodeTypeStyle(type).name)}</span>
      <span>{distance}</span>
    </Typography>
  );
};

export default styled(NodeLable)`
  display: flex;
  gap: 16px;
  > span:first-of-type {
    min-width: 58px;
  }
  > span:nth-of-type(2) {
    min-width: 64px;
  }
  > * {
    flex-grow: 0;
  }
`;
