import styled from "@emotion/styled";
import { nonNullable } from "@fh/utils";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { Alert, AlertTitle, Paper, Typography } from "@mui/material";
import { OrgType, Ship, WarfareContext } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFhCore, useShipName } from "../../../hooks";
import { Tabs, TabItem } from "../../molecules";
import AttackTable from "../AttackTable";

export const isEnemy = (type: OrgType) =>
  type === "EnemySingle" || type === "EnemyCombined";

const getTypeColor = (type: OrgType) =>
  isEnemy(type) ? "secondary.light" : "primary.light";

type WarfareAnalyzerProps = {
  ctx: WarfareContext;
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
  const { t } = useTranslation("common");
  const { analyzer } = useFhCore();
  const attackerName = useShipName(attacker.ship_id, attacker.is_abyssal());
  const targetName = useShipName(target.ship_id, target.is_abyssal());
  const attackerOrgType = ctx.attacker_env.org_type || "Single";
  const targetOrgType = ctx.target_env.org_type || "Single";

  if (ctx.attacker_env.org_type === ctx.target_env.org_type) {
    const attackerText = t(`OrgType.${attackerOrgType}`);
    const targetText = t(`OrgType.${targetOrgType}`);

    return (
      <Alert className={className} style={style} severity="error">
        <AlertTitle>
          <Typography alignItems="center" display="flex" gap={1}>
            {attackerText}
            <ArrowForward fontSize="inherit" />
            {targetText} は攻撃できません
          </Typography>
        </AlertTitle>
      </Alert>
    );
  }

  const info = analyzer.analyze_warfare(ctx, attacker, target);
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
      label: t("WarfareType.Torpedo"),
      panel: <AttackTable type="Torpedo" info={closing_torpedo} />,
    },
    night && {
      label: t("Night"),
      panel: <AttackTable type={night.attack_type.t} info={night} />,
    },
    openingAsw && {
      label: t("OpeningAsw"),
      panel: <AttackTable type="Asw" info={openingAsw} />,
    },
    shelling_support && {
      label: t("Support"),
      panel: <AttackTable type="Shelling" info={shelling_support} />,
    },
  ].filter(nonNullable);

  const attackerColor = getTypeColor(attackerOrgType);
  const targetColor = getTypeColor(targetOrgType);

  return (
    <Paper className={className} style={style}>
      <Typography alignItems="center" display="flex" gap={1}>
        <Typography variant="inherit" component="span" color={attackerColor}>
          {attackerName}
        </Typography>
        <ArrowForward fontSize="inherit" />
        <Typography variant="inherit" component="span" color={targetColor}>
          {targetName}
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
