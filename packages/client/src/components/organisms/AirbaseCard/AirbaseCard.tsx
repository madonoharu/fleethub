import React from "react"
import styled from "styled-components"
import { Plan, PlanState, Airbase, AirbaseState, AirbaseKey } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { EquipmentList } from "../../../components"
import { Update } from "../../../utils"

type Props = {
  label?: string
  airbase: Airbase
  update: Update<AirbaseState>
}

const AirbaseCard: React.FCX<Props> = ({ className, label, airbase, update }) => {
  return (
    <Paper className={className}>
      {label}
      <EquipmentList equipment={airbase.equipment} update={update} canEquip={airbase.canEquip} />
      制空: {airbase.fighterPower} 半径: {airbase.radius}
    </Paper>
  )
}

export default styled(AirbaseCard)`
  min-width: 160px;
`
