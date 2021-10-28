/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import { AirState } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

const Label = styled.span`
  display: inline-block;
  min-width: 48px;
`;

const FighterPowerValue = styled.span<{ airState: AirState }>(
  ({ theme, airState }) => css`
    color: ${theme.colors[airState]};
    margin-left: 8px;
  `
);

type EnemyFighterPowerProps = {
  fp: [number, number, number, number];
  label?: string;
};

const EnemyFighterPower: React.FCX<EnemyFighterPowerProps> = ({
  className,
  fp,
  label,
}) => {
  const { t } = useTranslation("common");
  return (
    <Typography className={className} component="div" variant="body2">
      {label && <Label>{label}</Label>}
      <FighterPowerValue airState={"AirSupremacy"}>
        {t("AirSupremacy")} {fp[3]}
      </FighterPowerValue>
      <FighterPowerValue airState={"AirSuperiority"}>
        {t("AirSuperiority")} {fp[2]}
      </FighterPowerValue>
      <FighterPowerValue airState={"AirParity"}>
        {t("AirParity")} {fp[1]}
      </FighterPowerValue>
      <FighterPowerValue airState={"AirDenial"}>
        {t("AirDenial")} {fp[0]}
      </FighterPowerValue>
    </Typography>
  );
};

export default EnemyFighterPower;
