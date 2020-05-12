import React from "react"
import { FleetState, ShipState } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { ShipCard } from "../../../components"
import { useShipSelectActions, useFhSystem } from "../../../hooks"
import { Update } from "../../../utils"

type ConnectedShipCardProps = {
  state?: ShipState
  index: number
  updateFleet: Update<FleetState>
}

const useFleetShip = ({ state, index, updateFleet }: ConnectedShipCardProps) => {
  const fhSystem = useFhSystem()
  const ship = state && fhSystem.createShip(state)

  const shipSelectActions = useShipSelectActions()

  const { openShipSelect, updateShip } = React.useMemo(() => {
    const createShip = (shipState: ShipState) => {
      updateFleet((draft) => {
        draft.ships[index] = shipState
      })
    }

    const openShipSelect = () => shipSelectActions.open(createShip)

    const updateShip: Update<ShipState> = (updater) => {
      updateFleet((draft) => {
        const next = draft.ships[index]
        next && updater(next)
      })
    }

    return { openShipSelect, updateShip }
  }, [index, updateFleet, shipSelectActions])

  return { openShipSelect, updateShip, ship }
}

const ConnectedShipCard: React.FC<ConnectedShipCardProps> = (props) => {
  const { openShipSelect, updateShip, ship } = useFleetShip(props)

  if (!ship) return <Button onClick={openShipSelect}>add</Button>

  return <ShipCard ship={ship} update={updateShip} />
}

type Props = {
  state: FleetState
  update: Update<FleetState>
}

const FleetEditor: React.FC<Props> = ({ state, update }) => {
  return (
    <Paper>
      {state.ships.map((shipState, index) => (
        <ConnectedShipCard key={index} state={shipState} index={index} updateFleet={update} />
      ))}
    </Paper>
  )
}

export default FleetEditor
