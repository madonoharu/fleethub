import React from "react"
import styled from "styled-components"
import { Plan, PlanAnalyzer, Ship, AirState, getNightAbility } from "@fleethub/core"
import { ComposedChart, Bar, PieChart, Pie, Cell } from "recharts"

import { Button, Typography, FormControlLabel, Checkbox, colors } from "@material-ui/core"
import BarChartIcon from "@material-ui/icons/BarChart"

import { Table } from "../.."
import { toPercent } from "../../../utils"
import { Flexbox } from "../../atoms"
import { useModal } from "../../../hooks"

type Props = {
  plan: Plan
}

const NightCutinTable: React.FCX<Props> = ({ className, plan }) => {
  const [searchlight, setSearchlight] = React.useState(false)
  const [starshell, setStarshell] = React.useState(false)

  const analysis = new PlanAnalyzer(plan).analyzeNight()

  return (
    <div>
      <FormControlLabel
        label="探照灯"
        control={<Checkbox size="small" checked={searchlight} onChange={() => setSearchlight(!searchlight)} />}
      />
      <FormControlLabel
        label="照明弾"
        control={<Checkbox size="small" checked={starshell} onChange={() => setStarshell(!starshell)} />}
      />
      夜間触接率 {toPercent(plan.f1.nightContactChance.rank1)}
      <Table
        data={analysis}
        columns={[
          { label: "艦娘", getValue: (datum) => datum.ship.name },
          { label: "CI", getValue: (datum) => datum.attacks.map((attack) => attack.type) },
        ]}
      />
    </div>
  )
}

export default styled(NightCutinTable)``
