import ArrowForward from "@mui/icons-material/ArrowForward";
import { Paper, Typography } from "@mui/material";
import type { AttackAnalysis } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { useShipName } from "../../../hooks";
import { Tabs, TabItem } from "../../molecules";
import AttackTable from "../AttackTable";
import { cn } from "../../../styles";

interface Props {
  analysis: AttackAnalysis;
}

const AttackAnalysisCard: React.FCX<Props> = ({ className, style, analysis }) => {
  const { t } = useTranslation("common");

  const {
    attacker_is_player,
    attacker_ship_id,
    target_ship_id,
    day,
    night,
    closing_torpedo,
    opening_asw,
    support_shelling,
  } = analysis;

  const list: TabItem[] = [
    day.is_active && {
      label: t("Day"),
      panel: <AttackTable report={day} />,
    },
    closing_torpedo.is_active && {
      label: t("AttackType.Torpedo"),
      panel: <AttackTable report={closing_torpedo} />,
    },
    night.is_active && {
      label: t("Night"),
      panel: <AttackTable report={night} />,
    },
    opening_asw.is_active && {
      label: t("OpeningAsw"),
      panel: <AttackTable report={opening_asw} />,
    },
    support_shelling.is_active && {
      label: t("Support"),
      panel: <AttackTable report={support_shelling} />,
    },
  ];

  const attackerName = useShipName(attacker_ship_id, attacker_ship_id > 1500);
  const targetName = useShipName(target_ship_id, target_ship_id > 1500);

  const attackerClassName = attacker_is_player ? "text-primary-light" : "text-secondary-light";
  const targetClassName = attacker_is_player ? "text-secondary-light" : "text-primary-light";

  return (
    <Paper className={className} style={style}>
      <Typography className="items-center flex gap-2">
        <Typography variant="inherit" component="span" className={attackerClassName}>
          {attackerName}
        </Typography>
        <ArrowForward fontSize="inherit" />
        <Typography variant="inherit" component="span" className={targetClassName}>
          {targetName}
        </Typography>
      </Typography>

      <Tabs list={list} size="small" />
    </Paper>
  );
};

export default ({ className, ...props }: React.ComponentProps<typeof AttackAnalysisCard>) => (
  <AttackAnalysisCard {...props} className={cn("p-2 min-h-80 min-w-120", className)} />
);
