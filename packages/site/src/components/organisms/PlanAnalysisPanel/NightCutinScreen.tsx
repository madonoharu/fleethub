import styled from "@emotion/styled";
import {
  NightCutinRateAnalysis,
  Org,
  OrgNightCutinRateAnalysis,
} from "@fleethub/core";
import React from "react";

import { useFhCore } from "../../../hooks";
import { toPercent } from "../../../utils";
import { Checkbox, LabeledValue } from "../../atoms";
import ShipNameplate from "../ShipNameplate";
import Table from "../Table";
import AttackChip from "./AttackChip";

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

const NightCutinRateCell: React.FC<{ data: NightCutinRateAnalysis }> = ({
  data,
}) => {
  const total = data.rates
    .map(([, rate]) => Number(rate))
    .reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: "flex", alignItems: "flex-end" }}>
      <LeftContainer>
        {data.rates.map(([ci, rate]) => (
          <StyledLabeledValue
            key={ci}
            label={<AttackChip night attack={ci} />}
            value={toPercent(rate)}
          />
        ))}
      </LeftContainer>
      <RightContainer>
        <StyledLabeledValue label="CI項" value={data.cutin_term} />
        <StyledLabeledValue label="合計" value={toPercent(total)} />
      </RightContainer>
    </div>
  );
};

type Props = {
  analysis: OrgNightCutinRateAnalysis;
};

const NightCutinTable: React.FCX<Props> = ({ className, analysis }) => {
  return (
    <div className={className}>
      夜間触接率 {toPercent(analysis.contact_chance.total)}
      <Table
        padding="none"
        data={analysis.ships}
        columns={[
          {
            label: "艦娘",
            getValue: (datum) => <ShipNameplate shipId={datum.ship_id} />,
            width: 160,
          },
          {
            label: "小破以上",
            getValue: (datum) => <NightCutinRateCell data={datum.normal} />,
          },
          {
            label: "中破",
            getValue: (datum) => <NightCutinRateCell data={datum.chuuha} />,
          },
        ]}
      />
    </div>
  );
};

const toggle = (value: boolean) => !value;

const NightCutinPanel: React.FC<{ org: Org }> = ({ org }) => {
  const { core } = useFhCore();

  const [attackerSearchlight, setAttackerSearchlight] = React.useState(false);
  const [attackerStarshell, setAttackerStarshell] = React.useState(false);

  const [defenderSearchlight, setDefenderSearchlight] = React.useState(false);
  const [defenderStarshell, setDefenderStarshell] = React.useState(false);

  const analysis: OrgNightCutinRateAnalysis = core.analyze_night_cutin(
    org,
    {
      contact_rank: null,
      searchlight: attackerSearchlight,
      starshell: attackerStarshell,
    },
    {
      contact_rank: null,
      searchlight: defenderSearchlight,
      starshell: defenderStarshell,
    }
  );

  return (
    <div>
      <Checkbox
        size="small"
        label="探照灯"
        checked={attackerSearchlight}
        onChange={() => setAttackerSearchlight(toggle)}
      />
      <Checkbox
        size="small"
        label="照明弾"
        checked={attackerStarshell}
        onChange={() => setAttackerStarshell(toggle)}
      />
      <Checkbox
        size="small"
        label="相手探照灯"
        checked={defenderSearchlight}
        onChange={() => setDefenderSearchlight(toggle)}
      />

      <Checkbox
        size="small"
        label="相手照明弾"
        checked={defenderStarshell}
        onChange={() => setDefenderStarshell(toggle)}
      />

      <NightCutinTable analysis={analysis} />
    </div>
  );
};

export default NightCutinPanel;
