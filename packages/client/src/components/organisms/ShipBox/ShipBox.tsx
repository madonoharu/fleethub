import React from "react"
import { EntityId } from "@reduxjs/toolkit"
import { useDispatch } from "react-redux"
import styled from "@emotion/styled"
import { Ship } from "@fleethub/sim"
import { GearState } from "@fleethub/utils"

import { Button, ButtonProps } from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"

import { useModal, useShip } from "../../../hooks"
import { GearPosition, gearsSlice, shipsSlice } from "../../../store"

import ShipList from "../../templates/ShipList"

import ShipCard from "./ShipCard"

const AddShipButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outlined" {...props}>
    <AddIcon />
    艦娘
  </Button>
)

type Props = {
  id?: EntityId
  onShipChange?: (ship: Ship) => void
}

const ShipBox: React.FCX<Props> = ({ className, id, onShipChange }) => {
  const { ship, entity } = useShip(id || "")

  const dispatch = useDispatch()

  const Modal = useModal()

  const handleRemove = () => {
    id && dispatch(shipsSlice.actions.remove(id))
  }

  const handleGearChange = (state: GearState, to: GearPosition) => {
    dispatch(gearsSlice.actions.add(state, { ship: to }))
  }

  const handleShipChange = () => {
    Modal.show()
  }

  const element =
    !ship || !entity ? (
      <AddShipButton className={className} onClick={handleShipChange} />
    ) : (
      <ShipCard
        className={className}
        ship={ship}
        entity={entity}
        onRemove={handleRemove}
        onGearChange={handleGearChange}
      />
    )

  return (
    <>
      {element}
      <Modal full>
        <ShipList onSelect={onShipChange} />
      </Modal>
    </>
  )
}

export default styled(ShipBox)`
  height: ${24 * 7 + 16}px;
`
