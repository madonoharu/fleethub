import { Alert, AlertTitle, Typography } from "@mui/material";
import type { ShipAnalyzerConfig, OrgType, Ship } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFhCore } from "../../../hooks";
import AttackAnalysisCard from "../AttackAnalysisCard";

export function isEnemy(type: OrgType): boolean {
  return type === "EnemySingle" || type === "EnemyCombined";
}

interface Props {
  config: ShipAnalyzerConfig;
  left: Ship;
  right: Ship;
  attacker_is_left: boolean;
}

const AttackAnalyzer: React.FCX<Props> = ({
  className,
  style,
  config,
  left,
  right,
  attacker_is_left,
}) => {
  const { t } = useTranslation("common");
  const { analyzer } = useFhCore();

  const attackerOrgType = config.left?.org_type || "Single";
  const targetOrgType = config.right?.org_type || "Single";

  if (isEnemy(attackerOrgType) === isEnemy(targetOrgType)) {
    const attackerText = t(`OrgType.${attackerOrgType}`);
    const targetText = t(`OrgType.${targetOrgType}`);

    return (
      <Alert
        className={className}
        style={style}
        sx={{ p: 1, minHeight: 320 }}
        severity="error"
      >
        <AlertTitle>
          <Typography alignItems="center">
            {attackerText}と{targetText}は戦闘できません
          </Typography>
        </AlertTitle>
      </Alert>
    );
  }

  const analysis = analyzer.analyze_ship_attack(
    config,
    left,
    right,
    attacker_is_left
  );

  return (
    <AttackAnalysisCard
      className={className}
      style={style}
      analysis={analysis}
    />
  );
};

export default AttackAnalyzer;
