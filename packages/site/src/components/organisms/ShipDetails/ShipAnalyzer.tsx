import styled from "@emotion/styled";
import {
  Ship,
  AttackPowerModifiers,
  AttackPowerParams,
  AttackPower,
  WarfareContext,
  DayCutin,
  FhCore,
  ShellingAttackAnalysis,
} from "@fleethub/core";
import { Button, Typography, Paper } from "@material-ui/core";
import React, { createContext, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { numstr, toPercent } from "../../../utils";
import { InfoButton } from "../../molecules";
import AttackChip from "../AttackChip";
import Table from "../Table";
import AttackPowerDetails from "./AttackPowerDetails";

type ShipAnalyzerProps = {
  core: FhCore;
  context: WarfareContext;
  ship: Ship;
  target: Ship;
};

const ShipAnalyzer: React.FCX<ShipAnalyzerProps> = ({
  className,
  style,
  core,
  context,
  ship,
  target,
}) => {
  const { t } = useTranslation("common");

  const data: ShellingAttackAnalysis = core.analyze_shelling(
    context,
    ship,
    target
  );

  return (
    <Paper className={className} style={style}>
      <Typography variant="subtitle2">{t("Shelling")}</Typography>
      <Table
        padding="none"
        data={data.items}
        columns={[
          {
            label: t("SpecialAttack"),
            getValue: (item) => <AttackChip attack={item.cutin} />,
          },
          { label: t("Chance"), getValue: (item) => toPercent(item.rate) },
          {
            label: t("AttackPower"),
            getValue: ({ attack_power }) => {
              const color = attack_power?.is_capped ? "secondary" : undefined;
              return (
                <Typography variant="inherit" color={color}>
                  {numstr(attack_power?.normal) || "?"}
                </Typography>
              );
            },
            align: "right",
          },
          {
            label: t("Critical"),
            getValue: ({ attack_power }) => {
              const color = attack_power?.is_capped ? "secondary" : undefined;
              return (
                <Typography variant="inherit" color={color}>
                  {numstr(attack_power?.critical) || "?"}
                </Typography>
              );
            },
            align: "right",
          },
          {
            label: t("Details"),
            getValue: ({ attack_power, attack_power_params }) => {
              if (!attack_power || !attack_power_params) return null;
              return (
                <InfoButton
                  size="tiny"
                  title={
                    <AttackPowerDetails
                      power={attack_power}
                      params={attack_power_params}
                    />
                  }
                />
              );
            },
            align: "right",
          },
        ]}
      />
    </Paper>
  );
};

export default styled(ShipAnalyzer)`
  padding: 8px;
  height: ${24 * 8}px;
`;
