/** @jsxImportSource @emotion/react */
import { round } from "@fh/utils";
import { Paper, TableContainer, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { Org, SimulatorResult } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFhCore } from "../../../hooks";
import { StepConfig } from "../../../store";
import { toPercent } from "../../../utils";
import DamageStateMapBarChart from "../AttackTable/DamageStateMapBarChart";
import ShipBanner from "../ShipBanner";
import Table from "../Table";

type Props = {
  player: Org;
  enemy: Org;
  times: number;
  config: StepConfig;
};

const SimulatorResultTable: React.FCX<Props> = ({
  className,
  player,
  enemy,
  times,
  config,
}) => {
  const { t } = useTranslation("common");
  const { core } = useFhCore();

  const pf = player.clone_fleet("f1");

  let simResult: SimulatorResult | undefined;
  let executionTime: React.ReactNode = null;

  try {
    const startTime = performance.now();
    simResult = core.simulate_shelling_support(
      pf,
      enemy,
      {
        engagement: config.engagement,
        attacker_formation: config.player.formation,
        target_formation: config.enemy.formation,
        external_power_mods: config.player.external_power_mods,
      },
      times
    );
    const endTime = performance.now();

    executionTime = (
      <Typography variant="body2" display="flex" gap={1}>
        <span>回数: {times}</span>
        <span>実行時間: {round((endTime - startTime) / 1000, 3)}秒</span>
      </Typography>
    );
  } catch (err) {
    console.error(err);
  }

  if (!simResult) {
    return null;
  }

  return (
    <div className={className}>
      {executionTime}
      <TableContainer component={Paper}>
        <Table
          size="small"
          data={simResult.sunk_vec}
          columns={[
            {
              label: t("Sunk"),
              getValue: ([n]) => n,
              align: "right",
            },
            {
              label: t("Individual"),
              getValue: (item) => toPercent(item[1]),
              align: "right",
            },
            {
              label: t("Cumulative"),
              getValue: (item) => toPercent(item[2]),
              align: "right",
            },
          ]}
        />
      </TableContainer>

      <TableContainer component={Paper}>
        <Table
          size="small"
          data={simResult.items}
          columns={[
            {
              label: "index",
              getValue: (item) => `${t(item.role)} ${item.index + 1}`,
            },
            {
              label: t("Ship"),
              getValue: (item) => {
                const ship = enemy.get_ship_by_id(item.id);
                return <ShipBanner shipId={ship?.ship_id || 0} />;
              },
            },
            {
              label: t("DamageState"),
              getValue: (item) => (
                <DamageStateMapBarChart data={item.damage_state_map} />
              ),
            },
          ]}
        />
      </TableContainer>
    </div>
  );
};

const Styled = styled(SimulatorResultTable)`
  display: flex;
  flex-direction: column;
  gap: 8px;

  tbody tr:last-of-type td {
    border-bottom-color: transparent;
  }
`;

export default React.memo(Styled);
