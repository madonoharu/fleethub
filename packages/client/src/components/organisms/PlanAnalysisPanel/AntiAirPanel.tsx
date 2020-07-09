import React from "react"
import styled from "styled-components"
import { Plan, PlanAnalyzer, RateMap, AntiAirCutin } from "@fleethub/core"
import { Label, Bar, PieChart, Pie, Cell } from "recharts"

import { Button, Typography, Box, Chip, colors } from "@material-ui/core"

import { Table } from "../.."
import { toPercent } from "../../../utils"
import { Flexbox, LabeledValue, Select } from "../../atoms"
import { useModal, useSelect } from "../../../hooks"

import ShipNameCell from "./ShipNameCell"
import AntiAirCutinChip from "./AntiAirCutinChip"
import { NumberInput } from "../../molecules"

const cutinColors = [colors.blue, colors.green, colors.yellow, colors.orange, colors.pink, colors.purple].map(
  (color) => color[300]
)
const getColor = (index: number): string => cutinColors[index % cutinColors.length]

const AntiAirCutinChanceChart: React.FC<{ rateMap: RateMap<AntiAirCutin> }> = ({ rateMap }) => {
  const width = 320
  const height = 240
  const cx = width / 2
  const cy = height / 2

  const data = rateMap.toArray().map(([ci, rate], index) => ({ name: ci.name, rate, color: getColor(index) }))
  data.push({ name: "不発", rate: rateMap.complement, color: colors.grey[300] })

  return (
    <PieChart width={width} height={height}>
      <Pie
        data={data}
        cx={cx}
        cy={cy}
        label={(datum) => `${datum.name}: ${toPercent(datum.rate)}`}
        innerRadius={60}
        outerRadius={70}
        dataKey="rate"
        animationBegin={0}
        animationDuration={600}
        animationEasing="ease-out"
        paddingAngle={4}
      >
        {data.map((datum, index) => (
          <Cell key={index} fill={datum.color} />
        ))}
        <Label value={`合計 ${toPercent(rateMap.total)}`} fill="white" position="center" />
      </Pie>
    </PieChart>
  )
}

const CutinChanceCell: React.FCX<{ rateMap: RateMap<AntiAirCutin> }> = ({ className, rateMap }) => {
  return (
    <div className={className}>
      {rateMap.toArray(([ci, rate]) => (
        <LabeledValue key={ci.id} label={<AntiAirCutinChip antiAirCutin={ci} />} value={toPercent(rate)} />
      ))}
    </div>
  )
}

const StyledCutinChanceCell = styled(CutinChanceCell)`
  width: 80px;
  margin-left: auto;
`

type AntiAirPanelProps = {
  plan: Plan
}

const AntiAirPanel: React.FC<AntiAirPanelProps> = ({ plan }) => {
  const [ci, setCi] = React.useState<AntiAirCutin>()
  const [adjustedAntiAirResist, setAdjustedAntiAirResist] = React.useState(1)
  const [fleetAntiAirResist, setFleetAntiAirResist] = React.useState(1)

  const analysis = new PlanAnalyzer(plan).analyzeAntiAir("CruisingFormation1", "Normal", ci)
  const cis = analysis.fleetAntiAirCutinChance.toArray(([ci]) => ci)
  const ciOptions: Array<AntiAirCutin | undefined> = [undefined, ...cis]

  return (
    <div>
      <Flexbox>
        <Select
          autoWidth
          label="対空CI"
          options={ciOptions}
          value={ci}
          onChange={setCi}
          getOptionLabel={(ci) => ci?.name || "無し"}
        />
        <NumberInput
          InputProps={{ style: { width: 80 } }}
          label="加重対空補正"
          step={0.1}
          min={0}
          max={1}
          value={adjustedAntiAirResist}
          onChange={setAdjustedAntiAirResist}
        />
        <NumberInput
          InputProps={{ style: { width: 80 } }}
          label="艦隊対空補正"
          step={0.1}
          min={0}
          max={1}
          value={fleetAntiAirResist}
          onChange={setFleetAntiAirResist}
        />
      </Flexbox>
      <Table
        padding="none"
        data={analysis.data}
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
      <Typography>対空CI艦隊発動率</Typography>
      <AntiAirCutinChanceChart rateMap={analysis.fleetAntiAirCutinChance} />
    </div>
  )
}

export default AntiAirPanel
