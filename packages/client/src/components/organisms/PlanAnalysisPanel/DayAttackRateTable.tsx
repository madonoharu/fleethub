import React from "react"
import styled from "styled-components"
import { Plan, PlanAnalyzer, DaySpecialAttack, RateMap, ShipShellingAbility } from "@fleethub/core"

import { Paper } from "@material-ui/core"

import { ShipBanner, Flexbox, Table, LabeledValue } from "../../../components"
import { usePlan, useModal } from "../../../hooks"
import { toPercent } from "../../../utils"

import AttackChip from "./AttackChip"
import ShipNameplate from "../../templates/ShipList/ShipNameplate"

const LeftContainer = styled.div`
  > * {
    margin-top: 4px;
    text-align: center;
  }
  > :last-child {
    margin-bottom: 4px;
  }
`

const RightContainer = styled(LeftContainer)`
  margin-left: 24px;
  line-height: 24px;
`

const AttackRateMapCell: React.FCX<{ ability: ShipShellingAbility }> = ({ className, ability }) => {
  return (
    <div className={className} style={{ display: "flex", alignItems: "flex-end" }}>
      <LeftContainer>
        {Array.from(ability.rateMap).map(([attack, rate]) => (
          <LabeledValue key={attack.type} label={<AttackChip attack={attack} />} value={toPercent(rate)} />
        ))}
      </LeftContainer>
      <RightContainer>
        <LabeledValue label="観測項" value={ability.observationTerm} />
        <LabeledValue label="合計" value={toPercent(ability.rateMap.total)} />
      </RightContainer>
    </div>
  )
}

type FleetDayAttackRateTableProps = {
  label: string
  data: ReturnType<PlanAnalyzer["analyzeFleetShelling"]>
}

const DayAttackRateTableFleet: React.FC<FleetDayAttackRateTableProps> = ({ label, data }) => {
  return (
    <div>
      {label} 艦隊索敵補正: {data.fleetLosModifier}
      <Table
        padding="none"
        data={Array.from(data).filter(([ship, rec]) => rec.AirSupremacy.canSpecialAttack)}
        columns={[
          {
            label: "艦娘",
            align: "left",
            getValue: ([ship]) => (
              <>
                <div>{ship.name}</div>
                <ShipBanner shipId={ship.shipId} />
              </>
            ),
          },
          {
            label: "確保",
            align: "left",
            getValue: ([ship, record], index) => <AttackRateMapCell key={index} ability={record.AirSupremacy} />,
          },
          {
            label: "優勢",
            align: "left",
            getValue: ([ship, record], index) => <AttackRateMapCell key={index} ability={record.AirSuperiority} />,
          },
        ]}
      />
    </div>
  )
}

type Props = {
  plan: Plan
}

const DayAttackRateTable: React.FCX<Props> = ({ className, plan }) => {
  const analyzer = new PlanAnalyzer(plan)
  const { main, escort } = analyzer.analyzeShelling()

  return (
    <div className={className}>
      <DayAttackRateTableFleet label="主力" data={main} />
      {escort && <DayAttackRateTableFleet label="護衛" data={escort} />}
    </div>
  )
}

export default styled(DayAttackRateTable)`
  padding: 8px;
  > * {
    margin-bottom: 24px;
  }
`
