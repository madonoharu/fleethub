/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { nonNullable } from "@fh/utils";
import { Paper, Typography } from "@mui/material";
import { Ship, WarfareAnalyzerContext, FhCore } from "fleethub-core";
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

  const ctx: WarfareAnalyzerContext = {
    attacker_env: state.player,
    target_env: state.enemy,
    engagement: state.engagement,
    air_state: state.air_state,
  };

  const info = analyzer.analyze_warfare(
    ctx,
    ship,
    dummyEnemySelectState.value.ship
  );

  const day = info?.day;
  const closing_torpedo = info?.closing_torpedo;
  const night = info?.night;
  const shelling_support = info.shelling_support;

  const aswInfo = submarine && analyzer.analyze_warfare(ctx, ship, submarine);
  const asw = aswInfo?.day;
  const openingAsw = aswInfo?.opening_asw;

  const list: TabItem[] = [
    day && {
      label: t("Day"),
      panel: <AttackTable type={day.attack_type.t} info={day} disableDamage />,
    },
    closing_torpedo && {
      label: t("WarfareTorpedo"),
      panel: (
        <AttackTable type="Torpedo" info={closing_torpedo} disableDamage />
      ),
    },
    night && {
      label: t("Night"),
      panel: (
        <AttackTable type={night.attack_type.t} info={night} disableDamage />
      ),
    },
    openingAsw && {
      label: t("PhaseOpeningAsw"),
      panel: <AttackTable type="Asw" info={openingAsw} disableDamage />,
    },
    asw && {
      label: t("WarfareAntiSub"),
      panel: <AttackTable type={asw.attack_type.t} info={asw} disableDamage />,
    },
    shelling_support && {
      label: t("Support"),
      panel: (
        <AttackTable type="Shelling" info={shelling_support} disableDamage />
      ),
    },
  ].filter(nonNullable);

  return (
    <Paper className={className} style={style} sx={{ paddingX: 1 }}>
      <Flexbox>
        <Typography variant="subtitle2">{t("AttackPower")}</Typography>
        <SelectedMenu label="敵種別" {...dummyEnemySelectState} />
      </Flexbox>

      <Tabs list={list} size="small" />
    </Paper>
  );
};

export default styled(AttackPowerAnalyzer)`
  min-height: ${24 * 8}px;
`;
