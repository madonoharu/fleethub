import styled from "@emotion/styled";
import { OrgType, Ship, WarfareAnalyzerContext } from "@fh/core";
import { nonNullable } from "@fh/utils";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { Paper, Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFhCore } from "../../../hooks";
import { Tabs, TabItem } from "../../molecules";
import AttackTable from "../AttackTable";

export const isEnemy = (type: OrgType) =>
  type === "EnemySingle" || type === "EnemyCombined";

const getTypeColor = (type: OrgType) =>
  isEnemy(type) ? "secondary.light" : "primary.light";

type WarfareAnalyzerProps = {
  ctx: WarfareAnalyzerContext;
  attacker: Ship;
  target: Ship;
};

const WarfareAnalyzer: React.FCX<WarfareAnalyzerProps> = ({
  className,
  style,
  ctx,
  attacker,
  target,
}) => {
  const { core } = useFhCore();
  const { t } = useTranslation("common");

  const info = core.analyze_warfare(ctx, attacker, target);
  const day = info?.day;
  const closing_torpedo = info?.closing_torpedo;
  const night = info?.night;
  const openingAsw = info?.opening_asw;
  const shelling_support = info?.shelling_support;

  const list: TabItem[] = [
    day && {
      label: t("Day"),
      panel: <AttackTable type={day.attack_type.t} info={day} />,
    },
    closing_torpedo && {
      label: t("WarfareTorpedo"),
      panel: <AttackTable type="Torpedo" info={closing_torpedo} />,
    },
    night && {
      label: t("Night"),
      panel: <AttackTable type={night.attack_type.t} info={night} />,
    },
    openingAsw && {
      label: t("PhaseOpeningAsw"),
      panel: <AttackTable type="Asw" info={openingAsw} />,
    },
    shelling_support && {
      label: t("Support"),
      panel: <AttackTable type="Shelling" info={shelling_support} />,
    },
  ].filter(nonNullable);

  const attackerColor = getTypeColor(ctx.attacker_env.org_type);
  const targetColor = getTypeColor(ctx.target_env.org_type);

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
