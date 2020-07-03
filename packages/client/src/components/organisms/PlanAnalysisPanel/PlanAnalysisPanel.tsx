import React from "react"
import styled from "styled-components"
import { Plan, PlanAnalyzer, DaySpecialAttack, RateMap } from "@fleethub/core"

import { Paper } from "@material-ui/core"

import { SelectButtons, PlanShareContent, Table } from "../../../components"
import { usePlan, useModal } from "../../../hooks"
import { toPercent } from "../../../utils"

import DayAttackRateTable from "./DayAttackRateTable"

type Props = {
  plan: Plan
}

const PlanAnalysisPanel: React.FC<Props> = ({ plan }) => {
  return (
    <Paper>
      <DayAttackRateTable plan={plan} />
    </Paper>
  )
}

export default PlanAnalysisPanel
