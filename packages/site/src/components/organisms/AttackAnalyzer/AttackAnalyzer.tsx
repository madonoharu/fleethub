import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Alert, AlertTitle, Typography } from "@mui/material";
import type { AttackAnalyzerConfig, OrgType, Ship } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFhCore } from "../../../hooks";
import AttackAnalysisCard from "../AttackAnalysisCard";

export function isEnemy(type: OrgType): boolean {
  return type === "EnemySingle" || type === "EnemyCombined";
}

interface Props {
  config: AttackAnalyzerConfig;
  attacker: Ship;
  target: Ship;
}

const AttackAnalyzer: React.FCX<Props> = ({
  className,
  style,
  config,
  attacker,
  target,
}) => {
  const { t } = useTranslation("common");
  const { analyzer } = useFhCore();

  const attackerOrgType = config.attacker?.org_type || "Single";
  const targetOrgType = config.target?.org_type || "Single";

  if (attackerOrgType === targetOrgType) {
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
          <Typography alignItems="center" display="flex" gap={1}>
            {attackerText}
            <ArrowForwardIcon fontSize="inherit" />
            {targetText} は攻撃できません
          </Typography>
        </AlertTitle>
      </Alert>
    );
  }

  const analysis = analyzer.analyze_attack(config, attacker, target);

  return (
    <AttackAnalysisCard
      className={className}
      style={style}
      analysis={analysis}
    />
  );
};

export default AttackAnalyzer;
