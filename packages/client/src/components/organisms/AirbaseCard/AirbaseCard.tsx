import React from "react"
import styled from "styled-components"
import { Plan, PlanState, Airbase, AirbaseState, AirbaseKey } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { EquipmentList } from "../../../components"
import { Update } from "../../../utils"

type Props = {
  airbase: Airbase
  update: Update<AirbaseState>
}

const AirbaseCard: React.FCX<Props> = ({ className, airbase, update }) => {
  return (
    <Paper className={className}>
      制空: 100 半径: 10
      <EquipmentList equipment={airbase.equipment} update={update} />
    </Paper>
  )
}

export default styled(AirbaseCard)`
  min-width: 160px;
`
