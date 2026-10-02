import { Typography } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React from "react";

type EnemyFighterPowerProps = {
  fp: [number, number, number, number];
  label?: string;
};

const EnemyFighterPower: React.FCX<EnemyFighterPowerProps> = ({ className, fp, label }) => {
  const { t } = useTranslation("common");
  return (
    <Typography className={className} component="div" variant="body2">
      {label && <span className="inline-block min-w-12">{label}</span>}
      <span className="ml-2 text-air-supremacy">
        {t("AirState.AirSupremacy")} {fp[3]}
      </span>
      <span className="ml-2 text-air-superiority">
        {t("AirState.AirSuperiority")} {fp[2]}
      </span>
      <span className="ml-2 text-air-parity">
        {t("AirState.AirParity")} {fp[1]}
      </span>
      <span className="ml-2 text-air-denial">
        {t("AirState.AirDenial")} {fp[0]}
      </span>
    </Typography>
  );
};

export default EnemyFighterPower;
