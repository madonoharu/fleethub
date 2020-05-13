import React from "react"
import { FleetState, Fleet } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { Update } from "../../../utils"

import ShipList from "./ShipList"

type Props = {
  fleet: Fleet
  update: Update<FleetState>
}

const FleetEditor: React.FC<Props> = ({ fleet, update }) => {
  return (
    <Paper>
      <ShipList ships={fleet.ships} updateFleet={update} />
    </Paper>
  )
}

export default FleetEditor
