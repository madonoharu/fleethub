import { Typography, Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { StatIcon } from "../../molecules";
import { cn } from "../../../styles";

const FactorValue = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span {...props} className={cn("relative bottom-[-4px] left-[-2px] text-[0.75rem]", className)} />
);

const ElosLabel: React.FCX<{ elos: number | undefined; factor: number }> = ({
  className,
  style,
  elos,
  factor,
}) => {
  const { t } = useTranslation("common");

  return (
    <Tooltip title={`${t("ElosNodeFactor")}${factor}`}>
      <Typography className={className} style={style} variant="body2" component="div">
        <StatIcon icon="los" />
        <FactorValue>{factor}</FactorValue>
        <span>{elos?.toFixed(2) ?? "?"}</span>
      </Typography>
    </Tooltip>
  );
};

export default ({ className, ...props }: React.ComponentProps<typeof ElosLabel>) => (
  <ElosLabel {...props} className={cn("flex items-center", className)} />
);
