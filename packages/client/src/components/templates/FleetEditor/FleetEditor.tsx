import React from "react"
import { FleetState, ShipState } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { ShipCard } from "../../../components"
import { useShipSelectActions, useFhSystem } from "../../../hooks"
import { Update } from "../../../utils"

import ShipList from "./ShipList"

type Props = {
  state: FleetState
  update: Update<FleetState>
}

const FleetEditor: React.FC<Props> = ({ state, update }) => {
  return (
    <Paper>
      <ShipList ships={state.ships} updateFleet={update} />
    </Paper>
  )
}

export default FleetEditor
