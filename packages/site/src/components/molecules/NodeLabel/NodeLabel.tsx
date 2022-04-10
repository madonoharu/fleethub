import styled from "@emotion/styled";
import { MapNode } from "@fh/utils";
import { Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { getNodeTypeStyle } from "../../../styles";

type NodeLabelProps = {
  name: string;
  type: MapNode["type"];
  d: MapNode["d"];
};

const NodeLabel: React.FCX<NodeLabelProps> = ({
  className,
  style,
  name,
  type,
  d,
}) => {
  const { t } = useTranslation("common");
  const distance = d && `${t("LbasDistance")}: ${d.join("→")}`;
  const typeName = getNodeTypeStyle(type).name;

  return (
    <Typography className={className} style={style} variant="subtitle2">
      <span>{name}</span>
      <span>{t(`nodeType.${typeName}`)}</span>
      <span>{distance}</span>
    </Typography>
  );
};

export default styled(NodeLabel)`
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
