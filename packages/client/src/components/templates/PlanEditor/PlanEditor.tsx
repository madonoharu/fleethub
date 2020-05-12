import React from "react"
import { PlanState, FleetState, ShipState } from "@fleethub/core"
import produce, { Draft } from "immer"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { FleetEditor } from "../../../components"
import { useShipSelectActions, useFhSystem } from "../../../hooks"

const getFleetState = (): FleetState => ({
  ships: [...Array(6)],
})

export type Update<T> = (updater: (draft: Draft<T>) => void) => void

const initialPlanState: PlanState = {
  name: "PlanEditor",
  fleets: [getFleetState(), getFleetState()],
  airbases: [],
}

const PlanEditor: React.FC = (props) => {
  const [state, setState] = React.useState<PlanState>(initialPlanState)
  const [fleetIndex, setFleetIndex] = React.useState(0)

  const update: Update<PlanState> = React.useCallback((updater) => setState(produce(updater)), [])

  const fleetState = state.fleets[fleetIndex]

  const updateFleet: Update<FleetState> = React.useCallback(
    (updater) => {
      update((draft) => updater(draft.fleets[fleetIndex]))
    },
    [fleetIndex, update]
  )

  const fleetElement = React.useMemo(() => {
    return <FleetEditor state={fleetState} update={updateFleet} />
  }, [fleetState, updateFleet])

  return (
    <Container>
      <TextField
        value={state.name}
        onChange={(event) => {
          update((draft) => {
            draft.name = event.currentTarget.value
          })
        }}
      />
      {fleetElement}
    </Container>
  )
}

export default PlanEditor
