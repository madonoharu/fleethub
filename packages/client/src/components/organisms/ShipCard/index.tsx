import React from "react"
import styled from "styled-components"
import { EntityId } from "@reduxjs/toolkit"

import { Typography, Button } from "@material-ui/core"

import { useShip } from "../../../hooks"

import ShipCard from "./ShipCard"

type ShipCardContainerProps = {
  ship: EntityId
  onAdd: () => void
}

const ShipCardContainer: React.FC<ShipCardContainerProps> = ({ ship, onAdd }) => {
  const { actions, gears, fhShip } = useShip(ship)
  const handleSlotsChange = React.useCallback((slots: number[]) => actions.update({ slots }), [actions])

  if (!fhShip) {
    return <Typography color="error">error</Typography>
  }

  return (
    <ShipCard
      ship={fhShip}
      gears={gears}
      onAddGear={actions.openGearSelect}
      onSlotsChange={handleSlotsChange}
      onUpdate={actions.update}
      onRemove={actions.remove}
    />
  )
}

const AddShipButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button variant="outlined" onClick={onClick}>
      add ship
    </Button>
  )
}

type ContainerProps = {
  ship?: EntityId
  onAdd: () => void
}

const Container: React.FC<ContainerProps> = ({ ship, onAdd }) => {
  if (!ship) {
    return <AddShipButton onClick={onAdd} />
  }

  return <ShipCardContainer ship={ship} onAdd={onAdd} />
}

export default Container
