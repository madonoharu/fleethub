import styled from "@emotion/styled";
import { Ship, WarfareContext, FhCore } from "@fleethub/core";
import { nonNullable } from "@fleethub/utils";
import { Paper, Typography } from "@mui/material";
import React, { useMemo } from "react";

import { useFhCore } from "../../../hooks";
import { Flexbox } from "../../atoms";
import { TabItem, Tabs, SelectedMenu } from "../../molecules";
import AttackTable from "../AttackTable";
import { useDummyEnemySelectState } from "./useDummyEnemySelectState";

type AttackPowerAnalyzerProps = {
  core: FhCore;
  context: WarfareContext;
  ship: Ship;
};

const ns = {
  night_contact_rank: null,
  starshell: false,
  searchlight: false,
};

const AttackPowerAnalyzer: React.FCX<AttackPowerAnalyzerProps> = ({
  className,
  style,
  context,
  ship,
}) => {
  const { core } = useFhCore();
  const dummyEnemySelectState = useDummyEnemySelectState();

  const submarine = useMemo(() => core.create_ship_by_id(1530), [core]);

  const params = {
    attacker_night_situation: ns,
    target_night_situation: ns,
    warfare_context: context,
  };

  const info = core.analyze_warfare(
    params,
    ship,
    dummyEnemySelectState.value.ship
  );
  const day = info?.day;
  const closing_torpedo = info?.closing_torpedo;
  const night = info?.night;

  const aswInfo = submarine && core.analyze_warfare(params, ship, submarine);
  const asw = aswInfo?.day;

  const list: TabItem[] = [
    day && {
      label: "昼戦",
      panel: <AttackTable type={day.attack_type.t} info={day} disableDamage />,
    },
    closing_torpedo && {
      label: "雷撃",
      panel: (
        <AttackTable type="Torpedo" info={closing_torpedo} disableDamage />
      ),
    },
    night && {
      label: "夜戦",
      panel: (
        <AttackTable type={night.attack_type.t} info={night} disableDamage />
      ),
    },
    asw && {
      label: "対潜",
      panel: <AttackTable type={asw.attack_type.t} info={asw} disableDamage />,
    },
  ].filter(nonNullable);

  return (
    <Paper className={className} style={style} sx={{ paddingX: 1 }}>
      <Flexbox>
        <Typography variant="subtitle2">攻撃力</Typography>
        <SelectedMenu label="敵種別" {...dummyEnemySelectState} />
      </Flexbox>

      <Tabs list={list} size="small" />
    </Paper>
  );
};

export default styled(AttackPowerAnalyzer)`
  min-height: ${24 * 8}px;
`;
