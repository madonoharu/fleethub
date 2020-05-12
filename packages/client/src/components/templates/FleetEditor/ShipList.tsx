import React from "react"
import styled from "styled-components"
import { NullableArray, Ship, ShipState, FleetState } from "@fleethub/core"

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
  ships: NullableArray<ShipState>
  updateFleet: Update<FleetState>
}

const ShipList: React.FCX<Props> = React.memo(({ className, ships, updateFleet }) => {
  return (
    <div className={className}>
      {ships.map((ship, index) => (
        <ConnectedShipCard key={index} state={ship} index={index} updateFleet={updateFleet} />
      ))}
    </div>
  )
})

export default styled(ShipList)`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
`
