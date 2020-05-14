import React from "react"
import styled from "styled-components"
import { NullableArray, Ship, ShipState, FleetState } from "@fleethub/core"

import { Button } from "@material-ui/core"

import { ShipCard } from "../../../components"
import { useShipSelectActions } from "../../../hooks"
import { Update } from "../../../utils"

type ConnectedShipCardProps = {
  ship?: Ship
  index: number
  updateFleet: Update<FleetState>
}

const useFleetShipActions = ({ index, updateFleet }: Pick<ConnectedShipCardProps, "index" | "updateFleet">) => {
  const shipSelectActions = useShipSelectActions()

  return React.useMemo(() => {
    const create = (shipState: ShipState) => {
      updateFleet((draft) => {
        draft.ships[index] = shipState
      })
    }

    const openShipSelect = () => shipSelectActions.open(create)

    const remove = () => {
      updateFleet((draft) => {
        draft.ships[index] = undefined
      })
    }

    const update: Update<ShipState> = (updater) => {
      updateFleet((draft) => {
        const next = draft.ships[index]
        next && updater(next)
      })
    }

    return { openShipSelect, create, update, remove }
  }, [index, updateFleet, shipSelectActions])
}

const ConnectedShipCard: React.FC<ConnectedShipCardProps> = ({ ship, ...rest }) => {
  const actions = useFleetShipActions(rest)

  if (!ship) return <Button onClick={actions.openShipSelect}>add</Button>

  return <ShipCard ship={ship} update={actions.update} onRemove={actions.remove} />
}

type Props = {
  ships: NullableArray<Ship>
  updateFleet: Update<FleetState>
}

const ShipList: React.FCX<Props> = React.memo(({ className, ships, updateFleet }) => {
  return (
    <div className={className}>
      {ships.map((ship, index) => (
        <ConnectedShipCard key={index} ship={ship} index={index} updateFleet={updateFleet} />
      ))}
    </div>
  )
})

export default styled(ShipList)`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
`
