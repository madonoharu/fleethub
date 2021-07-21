import styled from "@emotion/styled";
import {
  DayCutin,
  DayCutinRateAnalysis,
  FleetDayCutinRateAnalysis,
  Org,
  OrgDayCutinRateAnalysis,
  ShipDayCutinRateAnalysis,
} from "@fleethub/core";
import React from "react";

import { useFhCore } from "../../../hooks";
import { toPercent } from "../../../utils";
import { LabeledValue } from "../../atoms";
import Table from "../Table";
import AttackChip from "./AttackChip";
import ShipNameCell from "./ShipNameCell";

const LeftContainer = styled.div`
  > * {
    margin-top: 4px;
    text-align: center;
  }
  > :last-child {
    margin-bottom: 4px;
  }
`;

const RightContainer = styled(LeftContainer)`
  margin-left: 24px;
  line-height: 24px;
`;

const ShellingAbilityCell: React.FCX<{ data: DayCutinRateAnalysis }> = ({
  className,
  data,
}) => {
  const total = data.total_cutin_rate;
  return (
    <div
      className={className}
      style={{ display: "flex", alignItems: "flex-end" }}
    >
      <LeftContainer>
        {data.rates.map(([attack, rate], index) => (
          <LabeledValue
            key={index}
            label={<AttackChip attack={attack} />}
            value={rate != null ? toPercent(rate) : "不明"}
          />
        ))}
      </LeftContainer>
      <RightContainer>
        <LabeledValue label="観測項" value={data.observation_term} />
        <LabeledValue
          label="特殊攻撃率"
          value={total != null ? toPercent(total) : "不明"}
        />
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
              getValue: ({ name, banner }) => (
                <ShipNameCell name={name} banner={banner || ""} />
              ),
            },
            {
              label: "確保",
              getValue: (shipAnalysis) => (
                <ShellingAbilityCell data={shipAnalysis.air_supremacy} />
              ),
            },
            {
              label: "優勢",
              getValue: (shipAnalysis) => (
                <ShellingAbilityCell data={shipAnalysis.air_superiority} />
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

const DayAttackRateTable: React.FCX<Props> = ({ className, org }) => {
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

export default styled(DayAttackRateTable)`
  > * {
    margin-bottom: 24px;
  }
`;
