import React from "react"
import styled from "styled-components"
import { Ship, ShipState, FleetState, ShipKey, Fleet } from "@fleethub/core"

import { Button } from "@material-ui/core"

import { ShipCard } from "../../../components"
import { useShipSelectActions } from "../../../hooks"
import { Update } from "../../../utils"

type ConnectedShipCardProps = {
  ship?: Ship
  shipKey: ShipKey
  updateFleet: Update<FleetState>
}

const useFleetShipActions = ({ shipKey, updateFleet }: Pick<ConnectedShipCardProps, "shipKey" | "updateFleet">) => {
  const shipSelectActions = useShipSelectActions()

  return React.useMemo(() => {
    const create = (shipState: ShipState) => {
      updateFleet((draft) => {
        draft[shipKey] = shipState
      })
    }

    const openShipSelect = () => shipSelectActions.open(create)

    const remove = () => {
      updateFleet((draft) => {
        delete draft[shipKey]
      })
    }

    const update: Update<ShipState> = (recipe) => {
      updateFleet((draft) => {
        const next = draft[shipKey]
        next && recipe(next)
      })
    }

    return { openShipSelect, create, update, remove }
  }, [shipKey, updateFleet, shipSelectActions])
}

const ConnectedShipCard: React.FC<ConnectedShipCardProps> = React.memo<ConnectedShipCardProps>(({ ship, ...rest }) => {
  const actions = useFleetShipActions(rest)

  if (!ship) return <Button onClick={actions.openShipSelect}>add</Button>

  return <ShipCard ship={ship} update={actions.update} onRemove={actions.remove} />
})

type Props = {
  fleet: Fleet
  updateFleet: Update<FleetState>
}

const ShipList: React.FCX<Props> = React.memo(({ className, fleet, updateFleet }) => {
  return (
    <div className={className}>
      {fleet.entries.map(([key, ship]) => (
        <ConnectedShipCard key={key} shipKey={key} ship={ship} updateFleet={updateFleet} />
      ))}
    </div>
  )
})

export default styled(ShipList)`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
`
