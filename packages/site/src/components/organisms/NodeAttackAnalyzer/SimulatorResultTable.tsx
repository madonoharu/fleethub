import { round } from "@fh/utils";
import { Alert, Paper, TableContainer, Typography } from "@mui/material";

import type { Comp, NodeAttackAnalyzerConfig, SimulatorResult } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { useFhCore } from "../../../hooks";
import { toPercent } from "../../../utils";
import DamageStateDensityBarChart from "../AttackTable/DamageStateDensityBarChart";
import ShipBanner from "../ShipBanner";
import Table from "../Table";
import { cn } from "../../../styles";

interface Props {
  leftComp?: Comp;
  rightComp?: Comp;
  times: number;
  config: NodeAttackAnalyzerConfig;
}

const SimulatorResultTable: React.FCX<Props> = ({
  className,
  leftComp,
  rightComp,
  times,
  config,
}) => {
  const { t } = useTranslation("common");
  const { analyzer } = useFhCore();

  if (!leftComp || !rightComp) {
    return null;
  }

  if (!leftComp.has_route_sup()) {
    return (
      <div className={className}>
        <Alert severity="warning">支援艦隊が設定されていません</Alert>
      </div>
    );
  }

  let simResult: SimulatorResult | undefined;
  let executionTime: React.ReactNode = null;

  try {
    const startTime = performance.now();
    simResult = analyzer.simulate_support_shelling(leftComp, rightComp, config, times);
    const endTime = performance.now();

    executionTime = (
      <Typography className="flex gap-2" variant="body2">
        <span>回数: {times}</span>
        <span>実行時間: {round((endTime - startTime) / 1000, 3)}秒</span>
      </Typography>
    );
  } catch (err) {
    console.error(err);
    return (
      <div className={className}>
        <Alert severity="error">{String(err)}</Alert>
      </div>
    );
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
              label: t("DamageState.Sunk"),
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
              getValue: (item) => `${t(`FleetType.${item.fleet_type}`)} ${item.index + 1}`,
            },
            {
              label: t("Ship"),
              getValue: (item) => {
                const ship = rightComp.get_ship_by_eid_with_clone(item.id);
                return <ShipBanner shipId={ship?.ship_id || 0} />;
              },
            },
            {
              label: t("DamageState.name"),
              getValue: (item) => <DamageStateDensityBarChart data={item.damage_state_map} />,
            },
          ]}
        />
      </TableContainer>
    </div>
  );
};

const Styled = ({ className, ...props }: React.ComponentProps<typeof SimulatorResultTable>) => (
  <SimulatorResultTable
    {...props}
    className={cn(
      "flex flex-col gap-2 [&_tbody_tr:last-of-type_td]:[border-bottom-color:transparent]",
      className,
    )}
  />
);

export default React.memo(Styled);
