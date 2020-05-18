import React from "react"
import styled from "styled-components"
import { NullableArray, Ship, ShipState, FleetState, ShipKey } from "@fleethub/core"

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

    const update: Update<ShipState> = (updater) => {
      updateFleet((draft) => {
        const next = draft[shipKey]
        next && updater(next)
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
  ships: NullableArray<Ship>
  updateFleet: Update<FleetState>
}

const ShipList: React.FCX<Props> = React.memo(({ className, ships, updateFleet }) => {
  return (
    <div className={className}>
      {ships.map((ship, index) => (
        <ConnectedShipCard key={index} ship={ship} shipKey={`s${index + 1}` as ShipKey} updateFleet={updateFleet} />
      ))}
    </div>
  )
})

export default styled(ShipList)`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
`
