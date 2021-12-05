/** @jsxImportSource @emotion/react */
import { Typography, Stack } from "@mui/material";
import { FleetCutinInfo } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useCompContext } from "../../../hooks";
import { numstr } from "../../../utils";
import { createAttackTableColumns } from "../AttackTable/AttackTable";
import EngagementSelect from "../EngagementSelect";
import ShipNameplate from "../ShipNameplate";
import Table from "../Table";

type FleetCutinInfoTableProps = {
  data: FleetCutinInfo[];
};

const FleetCutinInfoTable: React.FCX<FleetCutinInfoTableProps> = ({
  className,
  data,
}) => {
  const { t } = useTranslation("common");
  const baseColumns = createAttackTableColumns(t, true);

  return (
    <Stack className={className} gap={2}>
      {data.map((info) => (
        <div key={info.formation}>
          <Typography variant="subtitle1">
            {t(info.cutin)} {t(info.formation)}
          </Typography>
          <Table
            size="small"
            data={info.items}
            columns={[
              {
                label: t("Ship"),
                getValue: (item) => <ShipNameplate shipId={item.ship_id} />,
              },
              {
                label: t("Modifier"),
                getValue: (item) => numstr(item.fleet_cutin_mod),
              },
              ...baseColumns,
            ]}
          />
        </div>
      ))}
    </Stack>
  );
};

type FleetCutinAnalysisTableProps = {
  type: "shelling" | "night";
};

const FleetCutinAnalysisTable: React.FCX<FleetCutinAnalysisTableProps> = ({
  className,
  type,
}) => {
  const { t } = useTranslation("common");
  const { comp, analyzer, state, bind } = useCompContext();

  const data = analyzer.analyze_fleet_cutin(comp, state.engagement)[type];

  if (!data.length) {
    return <Typography>艦隊特殊攻撃不可</Typography>;
  }

  return (
    <div className={className}>
      <EngagementSelect
        label={t("Engagement")}
        InputProps={{
          sx: { ml: "auto" },
        }}
        value={state.engagement}
        onChange={bind("engagement")}
      />
      <FleetCutinInfoTable data={data} />
    </div>
  );
};

export default FleetCutinAnalysisTable;
