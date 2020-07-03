import React from "react"
import styled from "styled-components"
import { Plan } from "@fleethub/core"

import { Paper } from "@material-ui/core"

import { Tabs, TabsProps } from "../../../components"

import DayAttackRateTable from "./DayAttackRateTable"

type Props = {
  plan: Plan
}

const PlanAnalysisPanel: React.FCX<Props> = ({ className, plan }) => {
  const list: TabsProps["list"] = [
    { label: "弾着戦爆発動率", panel: <DayAttackRateTable plan={plan} /> },
    { label: "触接率", panel: <>触接率</> },
    { label: "夜戦CI", panel: <>夜戦CI</> },
    { label: "航空戦", panel: <>航空戦</> },
    { label: "その他", panel: <>その他</> },
  ]

  return (
    <Paper className={className}>
      <Tabs list={list} />
    </Paper>
  )
}

export default styled(PlanAnalysisPanel)`
  padding: 8px;
  min-height: 480px;
`
