import { Tabs, Tab, Stack, Paper, Typography } from "@mui/material";
import type { Comp, Ship, NodeAttackAnalyzerConfig } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import { useFhCore } from "../../../hooks";
import { numstr } from "../../../utils";

import AttackReportDetails from "./AttackReportDetails";
import FleetCutinAnalysisTable from "./FleetCutinAnalysisTable";

const KEYS = [
  "day",
  "night",
  "closing_torpedo",
  "opening_asw",
  "support_shelling",
] as const;

type TabKey = typeof KEYS[number];

const labelMap = {
  day: "Day",
  night: "Night",
  closing_torpedo: "AttackType.Torpedo",
  opening_asw: "OpeningAsw",
  support_shelling: "Support",
} as const;

interface Props {
  config: NodeAttackAnalyzerConfig;
  leftComp: Comp | undefined;
  leftShip: Ship | undefined;
  rightComp: Comp | undefined;
  rightShip: Ship | undefined;
}

const NodeAttackDetails: React.FC<Props> = ({
  config,
  leftComp,
  leftShip,
  rightComp,
  rightShip,
}) => {
  const { t } = useTranslation("common");
  const { analyzer } = useFhCore();
  const [key, setKey] = useState<TabKey>("day");

  if (!leftComp || !leftShip || !rightComp || !rightShip) {
    return null;
  }

  const result = analyzer.analyze_node_attack(
    config,
    leftComp,
    leftShip,
    rightComp,
    rightShip
  );

  const handleChange = (event: unknown, value: TabKey) => {
    setKey(value);
  };

  const historical_mod =
    result.left.day.data["SingleAttack"]?.attack_power_params?.historical_mod;

  return (
    <Paper sx={{ p: 1 }}>
      <Tabs value={key} onChange={handleChange}>
        {KEYS.map((key) => (
          <Tab
            key={key}
            label={t(labelMap[key])}
            value={key}
            disabled={
              !result.left[key].is_active && !result.right[key].is_active
            }
          />
        ))}
      </Tabs>

      {historical_mod !== 1 && (
        <Typography>
          {t("historical_mod")}: {numstr(historical_mod)}
        </Typography>
      )}

      <Stack flexDirection="row" gap={1} flexWrap="wrap">
        <AttackReportDetails
          css={{ flexBasis: 1, flexGrow: 1 }}
          tag={key}
          analysis={result.left}
        />
        <AttackReportDetails
          css={{ flexBasis: 1, flexGrow: 1 }}
          tag={key}
          analysis={result.right}
        />
      </Stack>

      {key === "day" && (
        <FleetCutinAnalysisTable data={result.shelling_fleet_cutin} />
      )}
      {key === "night" && (
        <FleetCutinAnalysisTable data={result.night_fleet_cutin} />
      )}
    </Paper>
  );
};

export default NodeAttackDetails;
