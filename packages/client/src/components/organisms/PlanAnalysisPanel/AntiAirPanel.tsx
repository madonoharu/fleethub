import React from "react"
import styled from "@emotion/styled"
import { Plan, PlanAnalyzer, RateMap, AntiAirCutin, Formation } from "@fleethub/core"

import { Table } from "../.."
import { toPercent } from "../../../utils"
import { useSelectState } from "../../../hooks"

import { Flexbox, LabeledValue } from "../../atoms"
import { NumberInput, Select } from "../../molecules"

import AntiAirCutinChip from "./AntiAirCutinChip"
import AntiAirCutinChanceChart from "./AntiAirCutinChanceChart"
import FormationSelect from "../FormationSelect"

const CutinChanceCell: React.FCX<{ rateMap: RateMap<AntiAirCutin> }> = ({ className, rateMap }) => {
  return (
    <div className={className}>
      {rateMap.toArray(([ci, rate]) => (
        <LabeledValue key={ci.id} label={<AntiAirCutinChip antiAirCutin={ci} />} value={toPercent(rate)} />
      ))}
    </div>
  )
}

const Container = styled(Flexbox)`
  align-items: flex-end;
  margin-bottom: 8px;

  > div:first-of-type {
    margin-right: auto;
  }
`

const StyledChanceChart = styled(AntiAirCutinChanceChart)`
  margin: 0 auto;
`

const StyledCutinChanceCell = styled(CutinChanceCell)`
  width: 80px;
  margin-left: auto;
`

const StyledNumberInput = styled(NumberInput)`
  width: 120px;
`

type AntiAirPanelProps = {
  plan: Plan
}

const AntiAirPanel: React.FC<AntiAirPanelProps> = ({ plan }) => {
  const [adjustedAntiAirResist, setAdjustedAntiAirResist] = React.useState(1)
  const [fleetAntiAirResist, setFleetAntiAirResist] = React.useState(1)
  const [formation, setFormation] = React.useState<Formation>(plan.isCombined ? "Cruising1" : "LineAhead")

  const fleetCiChance = plan.antiAirCutinChance

  const cis = fleetCiChance
    .toArray()
    .filter(([ci, rate]) => rate > 0)
    .map(([ci]) => ci)
  const ciOptions: Array<AntiAirCutin | undefined> = [undefined, ...cis]
  const ciSelectState = useSelectState(ciOptions)

  const { data, fleetAntiAir } = new PlanAnalyzer(plan).analyzeAntiAir(formation, "Normal", ciSelectState.value)

  return (
    <div>
      <Container>
        <LabeledValue label="艦隊対空" value={fleetAntiAir.toFixed(2)} />

        <FormationSelect
          variant="outlined"
          label="陣形"
          combined={plan.isCombined}
          formation={formation}
          onChange={setFormation}
        />

        <Select
          css={{ width: 120 }}
          variant="outlined"
          label="対空CI"
          {...ciSelectState}
          getOptionLabel={(ci) => ci?.name || "無し"}
        />
        <StyledNumberInput
          variant="outlined"
          label="加重対空補正"
          step={0.1}
          min={0}
          max={1}
          value={adjustedAntiAirResist}
          onChange={setAdjustedAntiAirResist}
        />
        <StyledNumberInput
          variant="outlined"
          label="艦隊対空補正"
          step={0.1}
          min={0}
          max={1}
          value={fleetAntiAirResist}
          onChange={setFleetAntiAirResist}
        />
      </Container>

      <Table
        padding="none"
        data={data}
        columns={[
          { label: "艦娘", getValue: (datum) => datum.ship.name },
          { label: "加重対空", align: "right", getValue: (datum) => datum.adjustedAntiAir },
          {
            label: "割合撃墜",
            align: "right",
            getValue: (datum) => datum.calcProportionalShotdownRate(adjustedAntiAirResist).toFixed(4),
          },
          {
            label: "固定撃墜",
            align: "right",
            getValue: (datum) => datum.calcFixedShotdownNumber(adjustedAntiAirResist, fleetAntiAirResist),
          },
          { label: "最低保証", align: "right", getValue: (datum) => datum.minimumBonus },
          {
            label: "対空CI個艦発動率",
            align: "right",
            getValue: (datum) => <StyledCutinChanceCell rateMap={datum.antiAirCutinChance} />,
          },
          {
            label: "噴進弾幕発動率",
            align: "right",
            getValue: ({ antiAirPropellantBarrageChance: rate }) => (rate ? toPercent(rate) : "-"),
          },
        ]}
      />
      <StyledChanceChart label="対空CI艦隊発動率" rateMap={fleetCiChance} />
    </div>
  )
}

export default AntiAirPanel
