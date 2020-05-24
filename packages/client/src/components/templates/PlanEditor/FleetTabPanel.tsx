import React from "react"
import { PlanState, FleetState, FleetKey, Fleet } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { FleetEditor } from "../../../components"
import { Update } from "../../../utils"

type Props = {
  fleet: Fleet
  fleetKey: FleetKey
  updatePlan: Update<PlanState>
}

const FleetTabPanel: React.FC<Props> = ({ fleet, fleetKey, updatePlan }) => {
  const updateFleet: Update<FleetState> = React.useCallback(
    (recipe) => {
      updatePlan((draft) => {
        const fleetState = draft[fleetKey]
        if (fleetState) recipe(fleetState)
      })
    },
    [fleetKey, updatePlan]
  )

  return <FleetEditor fleet={fleet} update={updateFleet} />
}

export default FleetTabPanel
