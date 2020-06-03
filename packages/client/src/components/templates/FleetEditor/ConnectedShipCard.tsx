import React from "react"
import styled from "styled-components"
import { Ship, ShipState, FleetState, ShipKey, Fleet } from "@fleethub/core"

import { Button, ButtonProps } from "@material-ui/core"

import { ShipCard } from "../../../components"
import { useShipSelectActions, useSwap } from "../../../hooks"
import { Update } from "../../../utils"

type Props = {
  className?: string
  ship?: Ship
  shipKey: ShipKey
  updateFleet: Update<FleetState>
}

const useFleetShipActions = ({ shipKey, updateFleet }: Pick<Props, "shipKey" | "updateFleet">) => {
  const shipSelectActions = useShipSelectActions()

  return React.useMemo(() => {
    const set = (state?: ShipState) => {
      updateFleet((draft) => {
        draft[shipKey] = state
      })
    }

    const openShipSelect = () => shipSelectActions.open(set)

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

    return { openShipSelect, set, update, remove }
  }, [shipKey, updateFleet, shipSelectActions])
}

const AddShipButton = styled<React.FC<ButtonProps>>((props) => (
  <Button variant="outlined" {...props}>
    add
  </Button>
))`
  width: 100%;
  height: 100%;
`

const ConnectedShipCard = React.memo<Props>(({ className, ship, ...rest }) => {
  const actions = useFleetShipActions(rest)

  const [ref] = useSwap({
    type: "ship",
    state: ship?.state,
    setState: actions.set,
    canDrag: Boolean(ship),
  })

  let element: React.ReactElement
  if (ship) {
    element = <ShipCard ship={ship} update={actions.update} onRemove={actions.remove} />
  } else {
    element = <AddShipButton variant="outlined" fullWidth onClick={actions.openShipSelect} />
  }

  return (
    <div className={className} ref={ref}>
      {element}
    </div>
  )
})

export default ConnectedShipCard
