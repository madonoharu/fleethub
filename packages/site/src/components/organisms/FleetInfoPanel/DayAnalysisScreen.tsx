import { styled } from "@mui/material";
import { CompDayAnalysis, DayCutinReport } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { numstr, toPercent } from "../../../utils";
import { LabeledValue } from "../../atoms";
import AttackStyleChip from "../AttackStyleChip";
import ShipNameplate from "../ShipNameplate";
import Table from "../Table";

import FleetCutinAnalysisTable from "./FleetCutinAnalysisTable";

const LeftContainer = styled("div")`
  > * {
    margin-top: 4px;
  }
  > :last-child {
    margin-bottom: 4px;
  }
`;

const RightContainer = styled(LeftContainer)`
  margin-left: 24px;
  line-height: 24px;
`;

const DayCutinReportCell: React.FCX<{ report: DayCutinReport }> = ({
  className,
  report,
}) => {
  const { t } = useTranslation("common");
  const data = Object.values(report.data);
  data.sort((a, b) => (b.proc_rate ?? 0) - (a.proc_rate ?? 0));
  const singleRate = report.data["SingleAttack"]?.proc_rate;
  const total = typeof singleRate === "number" ? 1 - singleRate : null;

  return (
    <div
      className={className}
      css={{ display: "flex", alignItems: "flex-end" }}
    >
      <LeftContainer>
        {data.map((attack, index) => (
          <LabeledValue
            key={index}
            label={<AttackStyleChip attackStyle={attack.style} />}
            value={toPercent(attack.proc_rate)}
          />
        ))}
      </LeftContainer>
      <RightContainer>
        <LabeledValue
          label={t("observation_term")}
          value={numstr(report.observation_term) || "?"}
        />
        <LabeledValue label={t("SpecialAttack")} value={toPercent(total)} />
      </RightContainer>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
  isCombined: boolean;
  analysis: CompDayAnalysis;
}

const DayAnalysisScreen: React.FC<Props> = ({ isCombined, analysis }) => {
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
    <div>
      {fleetLosText}
      <Table
        padding="none"
        data={day_cutin.data}
        columns={[
          {
            label: t("Ship"),
            getValue: ({ ship_id }) => <ShipNameplate shipId={ship_id} />,
          },
          {
            label: t(`AirState.${day_cutin.air_states[0]}`),
            getValue: (item) => <DayCutinReportCell report={item.data[0]} />,
          },
          {
            label: t(`AirState.${day_cutin.air_states[1]}`),
            getValue: (item) => <DayCutinReportCell report={item.data[1]} />,
          },
        ]}
      />

      <FleetCutinAnalysisTable data={fleet_cutin} />
    </div>
  );
};

export default DayAnalysisScreen;
