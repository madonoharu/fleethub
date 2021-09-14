import styled from "@emotion/styled";
import { Org, NightCutinRateInfo, OrgNightCutinRateInfo } from "@fh/core";
import React from "react";

import { useFhCore } from "../../../hooks";
import { toPercent } from "../../../utils";
import { Checkbox, LabeledValue } from "../../atoms";
import AttackChip from "../AttackChip";
import ShipNameplate from "../ShipNameplate";
import Table from "../Table";

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
  info: OrgNightCutinRateInfo;
};

const NightCutinTable: React.FCX<Props> = ({ className, info }) => {
  return (
    <div className={className}>
      夜間触接率 {toPercent(info.contact_chance.total)}
      <Table
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
            getValue: (shipInfo) => (
              <NightCutinRateCell info={shipInfo.normal} />
            ),
          },
          {
            label: "中破",
            getValue: (shipInfo) => (
              <NightCutinRateCell info={shipInfo.chuuha} />
            ),
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

  // todo!
  const info: OrgNightCutinRateInfo = core.analyze_night_cutin(
    org,
    {
      night_contact_rank: null,
      searchlight: attackerSearchlight,
      starshell: attackerStarshell,
    },
    {
      night_contact_rank: null,
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

      <NightCutinTable info={info} />
    </div>
  );
};

export default NightCutinPanel;
