import styled from "@emotion/styled";
import {
  Org,
  ShellingAttackOrgAnalysis,
  ShellingAttackShipAnalysis,
  ShellingAttackType,
} from "@fleethub/core";
import React from "react";

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

const ShellingAbilityCell: React.FCX<{ data: ShellingAttackShipAnalysis }> = ({
  className,
  data,
}) => {
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
            value={toPercent(rate)}
          />
        ))}
      </LeftContainer>
      <RightContainer>
        <LabeledValue label="観測項" value={data.observation_term} />
        <LabeledValue label="特殊攻撃率" value={toPercent(data.cutin_rate)} />
      </RightContainer>
    </div>
  );
};

type FleetDayAttackRateTableProps = {
  label: string;
  data: ShellingAttackOrgAnalysis;
};

const FleetDayAttackRateTable: React.FC<FleetDayAttackRateTableProps> = ({
  label,
  data,
}) => {
  console.log(data);
  return (
    <div>
      {label} 艦隊索敵補正: {data.fleet_los_mod ?? "不明"}
      <Table
        padding="none"
        data={data.ships}
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
              <ShellingAbilityCell data={shipAnalysis} />
            ),
          },
          {
            label: "優勢",
            getValue: (shipAnalysis) => (
              <ShellingAbilityCell data={shipAnalysis} />
            ),
          },
        ]}
      />
    </div>
  );
};

type Props = {
  org: Org;
};

const DayAttackRateTable: React.FCX<Props> = ({ className, org }) => {
  const data = org.analyze();

  return (
    <div className={className}>
      <FleetDayAttackRateTable label="主力" data={data} />
      {/* {escort && <FleetDayAttackRateTable label="護衛" data={escort} />} */}
    </div>
  );
};

export default styled(DayAttackRateTable)`
  > * {
    margin-bottom: 24px;
  }
`;
