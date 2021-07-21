import styled from "@emotion/styled";
import {
  NightCutinRateAnalysis,
  Org,
  OrgNightCutinRateAnalysis,
} from "@fleethub/core";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import React from "react";

import { useFhCore } from "../../../hooks";
import { toPercent } from "../../../utils";
import { LabeledValue } from "../../atoms";
import Table from "../Table";
import AttackChip from "./AttackChip";
import ShipNameCell from "./ShipNameCell";

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
      夜間触接率 {toPercent(0)}
      <Table
        padding="none"
        data={analysis.ships}
        columns={[
          // {
          //   label: "艦娘",
          //   getValue: (datum) => <ShipNameCell ship={datum.ship} />,
          // },
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

const NightCutinPanel: React.FC<{ org: Org }> = ({ org }) => {
  const { core } = useFhCore();

  const [asl, setAsl] = React.useState(false);
  const [ass, setAss] = React.useState(false);

  const [dsl, setDsl] = React.useState(false);
  const [dss, setDss] = React.useState(false);

  const analysis: OrgNightCutinRateAnalysis = core.analyze_night_cutin(
    org,
    { contact_rank: null, searchlight: asl, starshell: ass },
    { contact_rank: null, searchlight: dsl, starshell: dss }
  );

  return (
    <div>
      <FormControlLabel
        label="探照灯"
        control={
          <Checkbox size="small" checked={asl} onChange={() => setAsl(!asl)} />
        }
      />
      <FormControlLabel
        label="照明弾"
        control={
          <Checkbox size="small" checked={ass} onChange={() => setAss(!ass)} />
        }
      />
      <FormControlLabel
        label="相手探照灯"
        control={
          <Checkbox size="small" checked={dsl} onChange={() => setDsl(!dsl)} />
        }
      />
      <FormControlLabel
        label="相手照明弾"
        control={
          <Checkbox size="small" checked={dss} onChange={() => setDss(!dss)} />
        }
      />

      <NightCutinTable analysis={analysis} />
    </div>
  );
};

export default NightCutinPanel;
