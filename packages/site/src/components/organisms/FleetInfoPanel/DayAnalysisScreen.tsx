import { styled, Stack, Typography } from "@mui/material";
import { CompDayAnalysis, DayCutinReport } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useCompContext } from "../../../hooks";
import { numstr, toPercent } from "../../../utils";
import { InfoButton } from "../../molecules";
import AttackStyleChip from "../AttackStyleChip";
import AttackPowerDetails from "../AttackTable/AttackPowerDetails";
import EngagementSelect from "../EngagementSelect";
import FormationSelect from "../FormationSelect";
import ShipNameplate from "../ShipNameplate";
import Table from "../Table";

import FleetCutinAnalysisTable from "./FleetCutinAnalysisTable";

const GridContainer1 = styled("div")`
  display: grid;
  grid-template-columns: auto auto 48px;
  justify-content: end;
  align-content: start;
  gap: 8px;
`;

const GridContainer2 = styled(GridContainer1)`
  grid-template-columns: auto 48px;
`;

const DayCutinReportCell: React.FCX<{ report: DayCutinReport }> = ({
  className,
  report,
}) => {
  const { t } = useTranslation("common");
  const singleRate = report.data["SingleAttack"]?.proc_rate;
  const total = typeof singleRate === "number" ? 1 - singleRate : null;

  const entries = Object.entries(report.data);
  entries.sort((a, b) => (b[1].proc_rate ?? 0) - (a[1].proc_rate ?? 0));

  return (
    <Stack className={className} direction="row" gap={1}>
      <GridContainer1>
        {entries.map(([key, attack]) => (
          <React.Fragment key={key}>
            <AttackStyleChip attack={attack.style} />
            <InfoButton
              title={
                <AttackPowerDetails
                  power={attack.attack_power}
                  params={attack.attack_power_params}
                />
              }
            />
            <Typography variant="inherit" align="right">
              {toPercent(attack.proc_rate)}
            </Typography>
          </React.Fragment>
        ))}
      </GridContainer1>
      <GridContainer2>
        <Typography component="span" variant="inherit" color="textSecondary">
          {t("observation_term")}
        </Typography>
        <Typography component="span" variant="inherit" align="right">
          {numstr(report.observation_term) || "?"}
        </Typography>
        <Typography component="span" variant="inherit" color="textSecondary">
          {t("SpecialAttack")}
        </Typography>
        <Typography component="span" variant="inherit" align="right">
          {toPercent(total)}
        </Typography>
      </GridContainer2>
    </Stack>
  );
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
  isCombined: boolean;
  analysis: CompDayAnalysis;
}

const DayAnalysisScreen: React.FC<Props> = ({ isCombined, analysis }) => {
  const { config, bind } = useCompContext();
  const { t } = useTranslation("common");
  const { day_cutin, fleet_cutin } = analysis;

  const mainFleetLos = numstr(day_cutin.main_fleet_los_mod) || "?";
  const escortFleetLos = numstr(day_cutin.escort_fleet_los_mod) || "?";
  let fleetLosText: string;
  if (isCombined) {
    fleetLosText = `${t("fleet_los_mod")}: ${t(
      `FleetType.Main`
    )} ${mainFleetLos} ${t(`FleetType.Escort`)} ${escortFleetLos}`;
  } else {
    fleetLosText = `${t("fleet_los_mod")}: ${mainFleetLos}`;
  }

  return (
    <Stack gap={1}>
      <Stack direction="row" gap={1}>
        <Typography>{fleetLosText}</Typography>
        <EngagementSelect
          sx={{ ml: "auto" }}
          value={config.engagement}
          onChange={bind("engagement")}
        />
        <FormationSelect
          value={config.formation}
          onChange={bind("formation")}
        />
      </Stack>
      <Table
        sx={{ mb: 2 }}
        data={day_cutin.ships}
        columns={[
          {
            label: t("Ship"),
            getValue: ({ ship_id, role, index }) => (
              <ShipNameplate shipId={ship_id} fleetType={role} index={index} />
            ),
          },
          {
            label: t(`AirState.${day_cutin.rank3_air_state}`),
            getValue: (item) => <DayCutinReportCell report={item.rank3} />,
          },
          {
            label: t(`AirState.${day_cutin.rank2_air_state}`),
            getValue: (item) => <DayCutinReportCell report={item.rank2} />,
          },
        ]}
      />

      <FleetCutinAnalysisTable data={fleet_cutin} />
    </Stack>
  );
};

export default DayAnalysisScreen;
