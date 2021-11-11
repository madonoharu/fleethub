/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Typography, Stack } from "@mui/material";
import {
  NightCutinRateInfo,
  FleetNightCutinRateInfo,
  NightSituation,
} from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";
import { useImmer } from "use-immer";

import { useFhCore } from "../../../hooks";
import { toPercent } from "../../../utils";
import { LabeledValue, Flexbox } from "../../atoms";
import AttackChip from "../AttackChip";
import NightSituationForm from "../NightSituationForm";
import ShipNameplate from "../ShipNameplate";
import Table from "../Table";
import FleetCutinAnalysisTable from "./FleetCutinAnalysisTable";
import { FleetInfoPanelProps } from "./FleetInfoPanel";

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

const initalNightSituation: NightSituation = {
  night_contact_rank: null,
  searchlight: false,
  starshell: false,
};

const NightCutinPanel: React.FC<FleetInfoPanelProps> = ({ org, fleetKey }) => {
  const { core } = useFhCore();
  const { t } = useTranslation("common");

  const [attacker, updateAttacker] =
    useImmer<NightSituation>(initalNightSituation);
  const [target, updateTarget] = useImmer<NightSituation>(initalNightSituation);

  const info: FleetNightCutinRateInfo = core.analyze_night_cutin(
    org,
    fleetKey,
    attacker,
    target
  );

  return (
    <Stack gap={1}>
      <Flexbox gap={1}>
        <Typography>
          夜間触接率 {toPercent(info.night_contact_chance.total)}
        </Typography>

        <Typography ml={5}>{t("攻撃側")}</Typography>
        <NightSituationForm
          value={attacker}
          onChange={updateAttacker}
          color="primary"
        />

        <Typography ml={5}>{t("相手側")}</Typography>
        <NightSituationForm
          value={target}
          onChange={updateTarget}
          color="secondary"
        />
      </Flexbox>

      <NightCutinTable info={info} />

      <FleetCutinAnalysisTable org={org} fleetKey={fleetKey} type="night" />
    </Stack>
  );
};

export default NightCutinPanel;
