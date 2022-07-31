import styled from "@emotion/styled";
import { Typography, Stack, Tooltip } from "@mui/material";
import { CompNightAnalysis, NightCutinActionReport } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useCompContext } from "../../../hooks";
import { toPercent } from "../../../utils";
import { LabeledValue, Flexbox } from "../../atoms";
import AttackStyleChip from "../AttackStyleChip";
import NightFleetConditionsForm from "../NightFleetConditionsForm";
import ContactRankIcon from "../NightFleetConditionsForm/ContactRankIcon";
import ShipNameplate from "../ShipNameplate";
import Table from "../Table";

import FleetCutinAnalysisTable from "./FleetCutinAnalysisTable";

const StyledLabeledValue = styled(LabeledValue)`
  margin-top: 4px;
  :last-child {
    margin-bottom: 4px;
  }
`;

const LeftContainer = styled.div`
  width: 120px;
  margin-right: 24px;
`;

const RightContainer = styled.div`
  line-height: 24px;
`;

const NightCutinActionReportCell: React.FC<{
  report: NightCutinActionReport;
}> = ({ report }) => {
  const { t } = useTranslation("common");

  if (!report.is_active) {
    return null;
  }

  const data = Object.values(report.data);
  data.sort((a, b) => (b.proc_rate ?? 0) - (a.proc_rate ?? 0));
  const singleRate = report.data["SingleAttack"]?.proc_rate;
  const total = typeof singleRate === "number" ? 1 - singleRate : null;

  return (
    <div style={{ display: "flex", alignItems: "flex-end" }}>
      <LeftContainer>
        {data.map((attack, index) => (
          <StyledLabeledValue
            key={index}
            label={<AttackStyleChip attackStyle={attack.style} />}
            value={toPercent(attack.proc_rate)}
          />
        ))}
      </LeftContainer>
      <RightContainer>
        <StyledLabeledValue label={t("cutin_term")} value={report.cutin_term} />
        <StyledLabeledValue label={t("Total")} value={toPercent(total)} />
      </RightContainer>
    </div>
  );
};

interface Props {
  analysis: CompNightAnalysis;
}

const NightAnalysisScreen: React.FCX<Props> = ({ className, analysis }) => {
  const { comp, config, bind } = useCompContext();
  const { t } = useTranslation("common");

  const { night_cutin, fleet_cutin } = analysis;

  const attackerColor = comp.is_enemy() ? "secondary" : "primary";
  const targetColor = comp.is_enemy() ? "primary" : "secondary";

  return (
    <Stack className={className} gap={1}>
      <Flexbox gap={1}>
        {([1, 2, 3] as const).map((n) => {
          const rate = night_cutin.night_contact_chance[`rank${n}`];

          if (n !== 1 && rate === 0) {
            return null;
          }

          const title = `${t("NightContact")} ${t(`ContactRank.Rank${n}`)}`;

          return (
            <Tooltip key={n} title={title}>
              <Typography
                variant="body2"
                display="flex"
                alignItems="center"
                component="div"
                gap={1}
              >
                <ContactRankIcon rank={`Rank${n}`} />
                <span>{toPercent(rate)}</span>
              </Typography>
            </Tooltip>
          );
        })}

        <Typography ml={5}>攻撃側</Typography>
        <NightFleetConditionsForm
          value={config.left_night_fleet_conditions}
          onChange={bind("left_night_fleet_conditions")}
          color={attackerColor}
        />

        <Typography ml={5}>相手側</Typography>
        <NightFleetConditionsForm
          value={config.right_night_fleet_conditions}
          onChange={bind("right_night_fleet_conditions")}
          color={targetColor}
        />
      </Flexbox>

      <Table
        padding="none"
        data={night_cutin.ships}
        columns={[
          {
            label: "艦娘",
            getValue: (ship) => <ShipNameplate shipId={ship.ship_id} />,
            width: 160,
          },
          {
            label: "小破以上",
            getValue: (ship) => (
              <NightCutinActionReportCell report={ship.normal} />
            ),
          },
          {
            label: "中破",
            getValue: (ship) => (
              <NightCutinActionReportCell report={ship.chuuha} />
            ),
          },
        ]}
      />

      <FleetCutinAnalysisTable data={fleet_cutin} />
    </Stack>
  );
};

export default NightAnalysisScreen;
