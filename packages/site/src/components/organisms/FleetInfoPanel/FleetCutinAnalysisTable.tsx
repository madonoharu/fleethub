/** @jsxImportSource @emotion/react */
import { FleetKey } from "@fh/utils";
import { Typography, Stack } from "@mui/material";
import { Org, FleetCutinInfo, Engagement } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { useFhCore } from "../../../hooks";

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
                getValue: (item) => item.fleet_cutin_mod,
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
  org: Org;
  fleetKey: FleetKey;
};

const FleetCutinAnalysisTable: React.FCX<FleetCutinAnalysisTableProps> = ({
  className,
  org,
  fleetKey,
}) => {
  const { t } = useTranslation("common");
  const { core } = useFhCore();
  const [engagement, setEngagement] = useState<Engagement>("Parallel");

  const result = core.analyze_fleet_cutin(org, fleetKey, engagement);

  if (!result.shelling.length) {
    return <Typography>艦隊特殊攻撃不可</Typography>;
  }

  return (
    <div className={className}>
      <EngagementSelect
        label={t("Engagement")}
        InputProps={{
          sx: { ml: "auto" },
        }}
        value={engagement}
        onChange={setEngagement}
      />
      <FleetCutinInfoTable data={result.shelling} />
    </div>
  );
};

export default FleetCutinAnalysisTable;
