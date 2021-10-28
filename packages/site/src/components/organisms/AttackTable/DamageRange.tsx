/** @jsxImportSource @emotion/react */
import { Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";
import { toPercent } from "../../../utils";

type DamageRangeProps = {
  min: number;
  max: number;
  scratchRate: number;
  isCapped?: boolean | null;
};

const DamageRange: React.FCX<DamageRangeProps> = ({
  min,
  max,
  scratchRate,
  isCapped,
}) => {
  const { t } = useTranslation("common");

  let text: string;

  const scratchText = `${t("ScratchDamage")} ${toPercent(scratchRate, 0)}`;

  if (scratchRate === 1) {
    text = scratchText;
  } else if (scratchRate > 0) {
    text = `${scratchText} ~ ${max}`;
  } else {
    text = `${min} ~ ${max}`;
  }

  return (
    <Typography variant="inherit" color={isCapped ? "secondary" : undefined}>
      {text}
    </Typography>
  );
};

export default DamageRange;
