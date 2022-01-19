/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Typography, Stack } from "@mui/material";
import { NightCutinRateInfo, FleetNightCutinRateInfo } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useCompContext } from "../../../hooks";
import { toPercent } from "../../../utils";
import { LabeledValue, Flexbox } from "../../atoms";
import AttackChip from "../AttackChip";
import NightSituationForm from "../NightSituationForm";
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

const NightCutinRateCell: React.FC<{ info: NightCutinRateInfo }> = ({
  info,
}) => {
  const total = info.rates
    .map(([, rate]) => Number(rate))
    .reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: "flex", alignItems: "flex-end" }}>
      <LeftContainer>
        {info.rates.map(([cutin, rate]) => (
          <StyledLabeledValue
            key={cutin}
            label={<AttackChip type="NightAttack" cutin={cutin} />}
            value={toPercent(rate)}
          />
        ))}
      </LeftContainer>
      <RightContainer>
        <StyledLabeledValue label="CI項" value={info.cutin_term} />
        <StyledLabeledValue label="合計" value={toPercent(total)} />
      </RightContainer>
    </div>
  );
};

type Props = {
  info: FleetNightCutinRateInfo;
};

const NightCutinTable: React.FCX<Props> = ({ className, info }) => {
  return (
    <Table
      className={className}
      padding="none"
      data={info.ships}
      columns={[
        {
          label: "艦娘",
          getValue: (shipInfo) => <ShipNameplate shipId={shipInfo.ship_id} />,
          width: 160,
        },
        {
          label: "小破以上",
          getValue: (shipInfo) => <NightCutinRateCell info={shipInfo.normal} />,
        },
        {
          label: "中破",
          getValue: (shipInfo) => <NightCutinRateCell info={shipInfo.chuuha} />,
        },
      ]}
    />
  );
};

const NightCutinPanel: React.FCX = ({ className }) => {
  const { t } = useTranslation("common");
  const { comp, analyzer, state, bind } = useCompContext();

  const info = analyzer.analyze_night_cutin(
    comp,
    state.attackerNightSituation,
    state.targetNightSituation
  );

  const attackerColor = comp.is_enemy() ? "secondary" : "primary";
  const targetColor = comp.is_enemy() ? "primary" : "secondary";

  return (
    <Stack className={className} gap={1}>
      <Flexbox gap={1}>
        <Typography>
          夜間触接率 {toPercent(info.night_contact_chance.total)}
        </Typography>

        <Typography ml={5}>{t("攻撃側")}</Typography>
        <NightSituationForm
          value={state.attackerNightSituation}
          onChange={bind("attackerNightSituation")}
          color={attackerColor}
        />

        <Typography ml={5}>{t("相手側")}</Typography>
        <NightSituationForm
          value={state.targetNightSituation}
          onChange={bind("targetNightSituation")}
          color={targetColor}
        />
      </Flexbox>

      <NightCutinTable info={info} />

      <FleetCutinAnalysisTable type="night" />
    </Stack>
  );
};

export default NightCutinPanel;
