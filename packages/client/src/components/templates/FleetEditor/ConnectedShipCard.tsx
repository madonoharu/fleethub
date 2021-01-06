import React from "react"
import styled from "@emotion/styled"
import { Ship, ShipState, FleetState, ShipKey } from "@fleethub/core"

import { Button, ButtonProps } from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"

import { ShipCard, Swappable } from "../../../components"
import { useModal } from "../../../hooks"
import { Update } from "../../../utils"

import ShipList from "../ShipList"

type Props = {
  className?: string
  ship?: Ship
  shipKey: ShipKey
  updateFleet: Update<FleetState>
}

const useFleetShipActions = ({ shipKey, updateFleet }: Pick<Props, "shipKey" | "updateFleet">) => {
  return React.useMemo(() => {
    const set = (state?: ShipState) => {
      updateFleet((draft) => {
        draft[shipKey] = state
      })
    }

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

    return { set, update, remove }
  }, [shipKey, updateFleet])
}

const AddShipButton = styled<React.FC<ButtonProps>>((props) => (
  <Button variant="outlined" {...props}>
    <AddIcon />
    艦娘
  </Button>
))`
  width: 100%;
  height: 100%;
`

const ConnectedShipCard = React.memo<Props>(({ className, ship, ...rest }) => {
  const actions = useFleetShipActions(rest)
  const Modal = useModal()

  const handleShipSelect = (ship: ShipState) => {
    actions.set(ship)
    Modal.hide()
  }

  let element: React.ReactElement
  if (ship) {
    element = <ShipCard ship={ship} update={actions.update} onRemove={actions.remove} />
  } else {
    element = <AddShipButton variant="outlined" fullWidth onClick={Modal.show} />
  }

  return (
    <>
      <Swappable className={className} type="ship" state={ship?.state} setState={actions.set} canDrag={Boolean(ship)}>
        {element}
      </Swappable>
      <Modal full>
        <ShipList onSelect={handleShipSelect} />
      </Modal>
    </>
  )
})

export default ConnectedShipCard
