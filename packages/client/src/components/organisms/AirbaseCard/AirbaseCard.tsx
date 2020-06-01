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
      制空: {airbase.fighterPower} 半径: {airbase.radius}
      <EquipmentList equipment={airbase.equipment} update={update} canEquip={airbase.canEquip} />
    </Paper>
  )
}

export default styled(AirbaseCard)`
  min-width: 160px;
`
