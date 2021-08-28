import styled from "@emotion/styled";
import {
  DayCutinRateAnalysis,
  FleetDayCutinRateAnalysis,
  Org,
  OrgDayCutinRateAnalysis,
} from "@fleethub/core";
import React from "react";

import { useFhCore } from "../../../hooks";
import { toPercent } from "../../../utils";
import { LabeledValue } from "../../atoms";
import AttackChip from "../AttackChip";
import ShipNameplate from "../ShipNameplate";
import Table from "../Table";

const LeftContainer = styled.div`
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

const CutinRateCell: React.FCX<{ data: DayCutinRateAnalysis }> = ({
  className,
  data,
}) => {
  const total = data.total_cutin_rate;
  return (
    <div
      className={className}
      css={{ display: "flex", alignItems: "flex-end" }}
    >
      <LeftContainer>
        {data.rates.map(([attack, rate], index) => (
          <LabeledValue
            key={index}
            label={<AttackChip attack={attack} />}
            value={toPercent(rate)}
          />
        ))}
      </LeftContainer>
      <RightContainer>
        <LabeledValue label="観測項" value={data.observation_term} />
        <LabeledValue label="特殊攻撃率" value={toPercent(total)} />
      </RightContainer>
    </div>
  );
};

type FleetDayAttackRateTableProps = {
  label: string;
  analysis: FleetDayCutinRateAnalysis;
};

const FleetDayAttackRateTable: React.FC<FleetDayAttackRateTableProps> = ({
  label,
  analysis,
}) => {
  return (
    <div>
      {label} 艦隊索敵補正: {analysis.fleet_los_mod ?? "不明"}
      {analysis.ships.length === 0 ? (
        "発動不可"
      ) : (
        <Table
          padding="none"
          data={analysis.ships}
          columns={[
            {
              label: "艦娘",
              getValue: ({ ship_id }) => <ShipNameplate shipId={ship_id} />,
            },
            {
              label: "確保",
              getValue: (shipAnalysis) => (
                <CutinRateCell data={shipAnalysis.air_supremacy} />
              ),
            },
            {
              label: "優勢",
              getValue: (shipAnalysis) => (
                <CutinRateCell data={shipAnalysis.air_superiority} />
              ),
            },
          ]}
        />
      )}
    </div>
  );
};

type Props = {
  org: Org;
};

const DayCutinRateTable: React.FCX<Props> = ({ className, org }) => {
  const { core } = useFhCore();
  const data: OrgDayCutinRateAnalysis = core.analyze_day_cutin(org);

  return (
    <div className={className}>
      <FleetDayAttackRateTable label="主力" analysis={data.main} />
      {org.is_combined() && (
        <FleetDayAttackRateTable label="護衛" analysis={data.escort} />
      )}
    </div>
  );
};

export default styled(DayCutinRateTable)`
  > * {
    margin-bottom: 24px;
  }
`;
