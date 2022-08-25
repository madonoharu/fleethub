import { Paper, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { Ship, FhCore } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React, { useMemo } from "react";

import { useFhCore } from "../../../hooks";
import { ShipDetailsState } from "../../../store";
import { Flexbox } from "../../atoms";
import { TabItem, Tabs, SelectedMenu } from "../../molecules";
import AttackTable from "../AttackTable";

import { useDummyEnemySelectState } from "./useDummyEnemySelectState";

type AttackPowerAnalyzerProps = {
  core: FhCore;
  state: ShipDetailsState;
  ship: Ship;
};

const AttackPowerAnalyzer: React.FCX<AttackPowerAnalyzerProps> = ({
  className,
  style,
  state,
  ship,
}) => {
  const { t } = useTranslation("common");
  const { core, analyzer } = useFhCore();
  const dummyEnemySelectState = useDummyEnemySelectState();
  const submarine = useMemo(() => core.create_ship_by_id(1530), [core]);

  const analysis = analyzer.analyze_attack(
    state,
    ship,
    dummyEnemySelectState.value.ship
  );

  const { day, closing_torpedo, night, support_shelling } = analysis;

  const aswAnalysis =
    submarine && analyzer.analyze_attack(state, ship, submarine);
  const dayAsw = aswAnalysis?.day;
  const openingAsw = aswAnalysis?.opening_asw;

  const list: TabItem[] = [
    day.is_active && {
      label: t("Day"),
      panel: <AttackTable report={day} variant="power" />,
    },
    closing_torpedo.is_active && {
      label: t("AttackType.Torpedo"),
      panel: <AttackTable report={closing_torpedo} variant="power" />,
    },
    night.is_active && {
      label: t("Night"),
      panel: <AttackTable report={night} variant="power" />,
    },
    openingAsw?.is_active && {
      label: t("OpeningAsw"),
      panel: <AttackTable report={openingAsw} variant="power" />,
    },
    dayAsw?.is_active && {
      label: t("AttackType.Asw"),
      panel: <AttackTable report={dayAsw} variant="power" />,
    },
    support_shelling.is_active && {
      label: t("Support"),
      panel: <AttackTable report={support_shelling} variant="power" />,
    },
  ];

  return (
    <Paper className={className} style={style} sx={{ paddingX: 1 }}>
      <Flexbox>
        <Typography variant="subtitle2">{t("AttackPower")}</Typography>
        <SelectedMenu label={t("EnemyType")} {...dummyEnemySelectState} />
      </Flexbox>

      <Tabs list={list} size="small" />
    </Paper>
  );
};

export default styled(AttackPowerAnalyzer)`
  min-height: ${24 * 8}px;
`;
