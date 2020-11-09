import React from "react"
import styled from "@emotion/styled"
import { Plan, PlanAnalyzer, ContactChance, AirState } from "@fleethub/core"

import { Typography } from "@material-ui/core"

import { toPercent } from "../../../utils"
import { useModal } from "../../../hooks"

import { Table } from "../.."

const AirStateDictionary: Record<AirState, string> = {
  AirSupremacy: "確保",
  AirSuperiority: "優勢",
  AirParity: "均衡",
  AirDenial: "劣勢",
  AirIncapability: "喪失",
}

type ContactChanceTableProps = {
  data: ContactChance[]
  label: string
}

const ContactChanceTable: React.FCX<ContactChanceTableProps> = ({ className, data, label }) => {
  const Modal = useModal()
  return (
    <div>
      <Typography color="textSecondary">{label}</Typography>
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
