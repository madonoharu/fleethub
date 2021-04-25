import styled from "@emotion/styled";
import { Plan, PlanAnalyzer, ShellingAbility } from "@fleethub/core";
import React from "react";

import { LabeledValue, Table } from "../../../components";
import { toPercent } from "../../../utils";
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

const ShellingAbilityCell: React.FCX<{ ability: ShellingAbility }> = ({
  className,
  ability,
}) => {
  return (
    <div
      className={className}
      style={{ display: "flex", alignItems: "flex-end" }}
    >
      <LeftContainer>
        {ability.rates.toArray().map(([attack, rate], index) => (
          <LabeledValue
            key={index}
            label={<AttackChip attack={attack} />}
            value={toPercent(rate)}
          />
        ))}
      </LeftContainer>
      <RightContainer>
        <LabeledValue label="観測項" value={ability.observationTerm} />
        <LabeledValue label="特殊攻撃率" value={toPercent(ability.cutinRate)} />
      </RightContainer>
    </div>
  );
};

type FleetDayAttackRateTableProps = {
  label: string;
  data: ReturnType<PlanAnalyzer["analyzeFleetShelling"]>;
};

const FleetDayAttackRateTable: React.FC<FleetDayAttackRateTableProps> = ({
  label,
  data,
}) => {
  return (
    <div>
      {label} 艦隊索敵補正: {data.fleetLosModifier}
      <Table
        padding="none"
        data={Array.from(data).filter(
          ([ship, rec]) => rec.AirSupremacy.rates.sum() > 0
        )}
        columns={[
          {
            label: "艦娘",
            getValue: ([ship]) => <ShipNameCell ship={ship} />,
          },
          {
            label: "確保",
            getValue: ([ship, record]) => (
              <ShellingAbilityCell ability={record.AirSupremacy} />
            ),
          },
          {
            label: "優勢",
            getValue: ([ship, record], index) => (
              <ShellingAbilityCell ability={record.AirSuperiority} />
            ),
          },
        ]}
      />
    </div>
  );
};

type Props = {
  plan: Plan;
};

const DayAttackRateTable: React.FCX<Props> = ({ className, plan }) => {
  const analyzer = new PlanAnalyzer(plan);
  const { main, escort } = analyzer.analyzeShelling();

  return (
    <div className={className}>
      <FleetDayAttackRateTable label="主力" data={main} />
      {escort && <FleetDayAttackRateTable label="護衛" data={escort} />}
    </div>
  );
};

export default styled(DayAttackRateTable)`
  > * {
    margin-bottom: 24px;
  }
`;
