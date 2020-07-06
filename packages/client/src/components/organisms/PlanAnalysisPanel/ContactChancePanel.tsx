import React from "react"
import styled from "styled-components"
import { Plan, PlanAnalyzer, ContactChance, AirState } from "@fleethub/core"
import { ComposedChart, Bar, PieChart, Pie, Cell } from "recharts"

import { Button, Typography, Box, colors } from "@material-ui/core"
import BarChartIcon from "@material-ui/icons/BarChart"

import { Table } from "../.."
import { toPercent } from "../../../utils"
import { Flexbox } from "../../atoms"
import { useModal } from "../../../hooks"

const AirStateDictionary: Record<AirState, string> = {
  AirSupremacy: "確保",
  AirSuperiority: "優勢",
  AirParity: "均衡",
  AirDenial: "劣勢",
  AirIncapability: "喪失",
}

const ContactChanceChart: React.FC<{ rate: ContactChance }> = ({ rate }) => {
  const { airState, rank1, rank2, rank3, total } = rate
  const data = [
    { name: "x1.2率", value: rank1, color: colors.lightBlue[300] },
    { name: "x1.17率", value: rank2, color: colors.green[300] },
    { name: "x1.12率", value: rank3, color: colors.orange[300] },
    { name: "不発率", value: 1 - total, color: colors.grey[300] },
  ]

  const width = 300
  const height = 240
  const cx = width / 2
  const cy = height / 2

  return (
    <PieChart width={width} height={height}>
      <Pie
        data={data}
        cx={cx}
        cy={cy}
        innerRadius={40}
        outerRadius={50}
        label={(datum) => `${datum.name} ${toPercent(datum.value)}` as any}
        dataKey="value"
        animationBegin={0}
        animationDuration={600}
        animationEasing="ease-out"
        paddingAngle={4}
      >
        {data.map((datum) => (
          <Cell key={datum.name} fill={datum.color} />
        ))}
      </Pie>
      <text x={cx} y={cy} dx={5} fill="white" textAnchor="middle">
        {AirStateDictionary[airState]}
      </text>
      <text x={cx} y={cy} dx={5} dy={16} fill="white" textAnchor="middle">
        合計 {toPercent(total)}
      </text>
    </PieChart>
  )
}

const TableCaption = styled(Flexbox)`
  button {
    margin-left: auto;
  }
`

const ChartContainer = styled(Flexbox)`
  height: 280px;
`

type ContactChanceTableProps = {
  data: ContactChance[]
  label: string
}

const ContactChanceTable: React.FCX<ContactChanceTableProps> = ({ className, data, label }) => {
  const Modal = useModal()
  return (
    <div>
      <TableCaption>
        <Typography color="textSecondary">{label}</Typography>
        <Button onClick={Modal.show} startIcon={<BarChartIcon />}>
          グラフで見る
        </Button>
      </TableCaption>
      <Table
        className={className}
        padding="none"
        data={data}
        columns={[
          { label: "制空", getValue: (datum) => AirStateDictionary[datum.airState] },
          { label: "開始率", align: "right", getValue: (datum) => toPercent(datum.trigger) },
          { label: "x1.2触接率", align: "right", getValue: (datum) => toPercent(datum.rank1) },
          { label: "x1.17触接率", align: "right", getValue: (datum) => toPercent(datum.rank2) },
          { label: "x1.12触接率", align: "right", getValue: (datum) => toPercent(datum.rank3) },
          { label: "合計触接率", align: "right", getValue: (datum) => toPercent(datum.total) },
        ]}
      />

      <Modal>
        <ChartContainer>
          <ContactChanceChart rate={data[0]} />
          <ContactChanceChart rate={data[1]} />
          <ContactChanceChart rate={data[2]} />
        </ChartContainer>
      </Modal>
    </div>
  )
}

type Props = {
  plan: Plan
}

const ContactChancePanel: React.FCX<Props> = ({ className, plan }) => {
  const { single, combined } = new PlanAnalyzer(plan).analyzeContact()

  return (
    <div className={className}>
      <ContactChanceTable label="対通常戦" data={single} />
      {combined && <ContactChanceTable label="対連合戦" data={combined} />}
    </div>
  )
}

export default styled(ContactChancePanel)`
  width: 620px;
  > * {
    margin-bottom: 16px;
  }
`
