import React from "react"
import styled from "@emotion/styled"
import { Plan, Fleet, NightAbility, analyzeNightAttacks } from "@fleethub/core"

import { FormControlLabel, Checkbox } from "@material-ui/core"

import { Table, LabeledValue } from "../../../components"
import { toPercent } from "../../../utils"

import AttackChip from "./AttackChip"
import ShipNameCell from "./ShipNameCell"

const StyledLabeledValue = styled(LabeledValue)`
  margin-top: 4px;
  :last-child {
    margin-bottom: 4px;
  }
`

const LeftContainer = styled.div`
  width: 120px;
  margin-right: 24px;
`

const RightContainer = styled.div`
  line-height: 24px;
`

const NightAbilityCell: React.FC<{ ability: NightAbility }> = ({ ability }) => {
  const total = ability.attacks.map((attack) => attack.rate).reduce((a, b) => a + b, 0)
  return (
    <div style={{ display: "flex", alignItems: "flex-end" }}>
      <LeftContainer>
        {ability.attacks.map((attack) => (
          <StyledLabeledValue
            key={attack.type}
            label={<AttackChip night attack={attack} />}
            value={toPercent(attack.rate)}
          />
        ))}
      </LeftContainer>
      <RightContainer>
        <StyledLabeledValue label="CI項" value={ability.cutinTerm} />
        <StyledLabeledValue label="合計" value={toPercent(total)} />
      </RightContainer>
    </div>
  )
}

type Props = {
  fleet: Fleet
  attackerSearchlight: boolean
  attackerStarshell: boolean
  defenderSearchlight: boolean
  defenderStarshell: boolean
}

const NightCutinTable: React.FCX<Props> = ({
  className,
  fleet,
  attackerSearchlight,
  attackerStarshell,
  defenderSearchlight,
  defenderStarshell,
}) => {
  const analysis = analyzeNightAttacks(fleet, {
    attackerState: { searchlight: attackerSearchlight, starshell: attackerStarshell, contactRank: 1 },
    defenderState: { searchlight: defenderSearchlight, starshell: defenderStarshell, contactRank: 1 },
  })

  return (
    <div>
      夜間触接率 {toPercent(fleet.nightContactChance.rank3)}
      <Table
        padding="none"
        data={analysis}
        columns={[
          {
            label: "艦娘",
            getValue: (datum) => <ShipNameCell ship={datum.ship} />,
          },
          {
            label: "小破以上",
            getValue: (datum) => <NightAbilityCell ability={datum.normal} />,
          },
          {
            label: "中破",
            getValue: (datum) => <NightAbilityCell ability={datum.chuuha} />,
          },
        ]}
      />
    </div>
  )
}

const getNightFleet = ({ main, escort, isEnemy }: Plan) => {
  if (!escort) return { nightFleet1: main }
  if (isEnemy) return { nightFleet1: main, nightFleet2: escort }
  return { nightFleet1: escort }
}

const NightCutinPanel: React.FC<{ plan: Plan }> = ({ plan }) => {
  const [asl, setAsl] = React.useState(false)
  const [ass, setAss] = React.useState(false)

  const [dsl, setDsl] = React.useState(false)
  const [dss, setDss] = React.useState(false)

  const { nightFleet1, nightFleet2 } = getNightFleet(plan)

  return (
    <div>
      <FormControlLabel
        label="探照灯"
        control={<Checkbox size="small" checked={asl} onChange={() => setAsl(!asl)} />}
      />
      <FormControlLabel
        label="照明弾"
        control={<Checkbox size="small" checked={ass} onChange={() => setAss(!ass)} />}
      />
      <FormControlLabel
        label="相手探照灯"
        control={<Checkbox size="small" checked={dsl} onChange={() => setDsl(!dsl)} />}
      />
      <FormControlLabel
        label="相手照明弾"
        control={<Checkbox size="small" checked={dss} onChange={() => setDss(!dss)} />}
      />

      <NightCutinTable
        fleet={nightFleet1}
        attackerSearchlight={asl}
        attackerStarshell={ass}
        defenderSearchlight={dsl}
        defenderStarshell={dss}
      />

      {nightFleet2 && (
        <NightCutinTable
          fleet={nightFleet2}
          attackerSearchlight={asl}
          attackerStarshell={ass}
          defenderSearchlight={dsl}
          defenderStarshell={dss}
        />
      )}
    </div>
  )
}

export default NightCutinPanel
