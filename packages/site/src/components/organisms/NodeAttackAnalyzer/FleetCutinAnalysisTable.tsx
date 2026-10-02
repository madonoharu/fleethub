import { Typography, Stack } from "@mui/material";
import { FleetCutinReport } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { numstr, toPercent } from "../../../utils";
import { createAttackTableColumns } from "../AttackTable/AttackTable";
import DamageStateDensityBarChart from "../AttackTable/DamageStateDensityBarChart";
import ShipNameplate from "../ShipNameplate";
import Table from "../Table";
import { cn } from "../../../styles";

interface Props {
  data: FleetCutinReport<unknown>[];
}

const FleetCutinAnalysisTable: React.FCX<Props> = ({ className, data }) => {
  const { t } = useTranslation("common");

  if (!data.length) {
    return null;
  }

  const baseColumns = createAttackTableColumns(t, false);

  return (
    <Stack className={cn("gap-4", className)}>
      {data.map((report) => (
        <div key={`${report.cutin}-${report.formation}`}>
          <Typography variant="subtitle1">
            {t(`FleetCutin.${report.cutin}`)} {t(`Formation.${report.formation}`)} {t(`ProcRate`)}{" "}
            {toPercent(report.rate)}
          </Typography>
          <Table
            size="small"
            data={report.attacks}
            columns={[
              {
                label: t("Ship"),
                getValue: (item) => <ShipNameplate shipId={item.ship_id} />,
              },
              {
                label: t("Modifier"),
                getValue: (item) => numstr(item.power_mod),
              },
              ...baseColumns,
              {
                label: "分布",
                getValue: (item) => {
                  const data = item.damage?.damage_state_density;
                  return data && <DamageStateDensityBarChart data={data} />;
                },
              },
            ]}
          />
        </div>
      ))}
    </Stack>
  );
};

export default FleetCutinAnalysisTable;
