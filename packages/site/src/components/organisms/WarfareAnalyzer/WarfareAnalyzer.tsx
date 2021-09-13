import styled from "@emotion/styled";
import { OrgType, Ship, WarfareAnalysisParams } from "@fleethub/core";
import { nonNullable } from "@fleethub/utils";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { Paper, Typography } from "@mui/material";
import React from "react";

import { useFhCore } from "../../../hooks";
import { Tabs, TabItem } from "../../molecules";
import AttackTable from "../AttackTable";

export const isEnemy = (type: OrgType) =>
  type === "EnemySingle" || type === "EnemyCombined";

const getTypeColor = (type: OrgType) =>
  isEnemy(type) ? "secondary.light" : "primary.light";

type WarfareAnalyzerProps = {
  params: WarfareAnalysisParams;
  attacker: Ship;
  target: Ship;
};

const WarfareAnalyzer: React.FCX<WarfareAnalyzerProps> = ({
  className,
  style,
  params,
  attacker,
  target,
}) => {
  const { core } = useFhCore();

  const info = core.analyze_warfare(params, attacker, target);
  const day = info?.day;
  const closing_torpedo = info?.closing_torpedo;
  const night = info?.night;

  const list: TabItem[] = [
    day && {
      label: "昼戦",
      panel: <AttackTable type={day.attack_type.t} info={day} />,
    },
    closing_torpedo && {
      label: "雷撃",
      panel: <AttackTable type="Torpedo" info={closing_torpedo} />,
    },
    night && {
      label: "夜戦",
      panel: <AttackTable type={night.attack_type.t} info={night} />,
    },
  ].filter(nonNullable);

  const attackerColor = getTypeColor(
    params.warfare_context.attacker_env.org_type
  );
  const targetColor = getTypeColor(params.warfare_context.target_env.org_type);

  return (
    <Paper className={className} style={style}>
      <Typography alignItems="center" display="flex">
        <Typography variant="inherit" component="span" color={attackerColor}>
          {attacker.name}
        </Typography>
        <ArrowForward fontSize="inherit" />
        <Typography variant="inherit" component="span" color={targetColor}>
          {target.name}
        </Typography>
      </Typography>
      <Tabs list={list} size="small" />
    </Paper>
  );
};

export default styled(WarfareAnalyzer)`
  padding: 8px;
  min-height: 320px;
`;
