import React from "react"
import styled from "styled-components"
import { EntityId } from "@reduxjs/toolkit"
import { Ship } from "@fleethub/core"

import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"
import Box from "@material-ui/core/Box"
import Paper from "@material-ui/core/Paper"

import { useShip } from "../../../hooks"
import { EquipmentControl, ShipBanner } from "../../../components"
import { NullableArray } from "../../../utils"
import { ShipEntity } from "../../../store"

import ShipHeader from "./Header"
import ShipStats from "./ShipStats"

const Content = styled.div`
  display: flex;
  margin-left: 8px;
  > :first-child {
    flex-shrink: 0;
  }
  > :last-child {
    min-width: 0;
  }
`

type ComponentProps = {
  className?: string
  ship: Ship
  gears: NullableArray<EntityId>
  onAddGear: (index: number) => void
  onRemove: () => void
  onUpdate: (changes: Partial<ShipEntity>) => void
  onSlotsChange: (slots: number[]) => void
}

const Component: React.FC<ComponentProps> = ({
  className,
  ship,
  gears,
  onAddGear,
  onUpdate,
  onRemove,
  onSlotsChange,
}) => {
  const handleLevelChange = (level: number) => {
    onUpdate({ level })
  }
  return (
    <Paper className={className}>
      <ShipHeader name={ship.name} level={ship.level} onLevelChange={handleLevelChange} onRemove={onRemove} />

      <Content>
        <Box width={160}>
          <ShipBanner shipId={ship.shipId} />
          <ShipStats ship={ship} onUpdate={onUpdate} />
        </Box>

        <EquipmentControl
          currentSlots={ship.equipment.currentSlots}
          initalSlots={ship.equipment.initialSlots}
          gears={gears}
          onAdd={onAddGear}
          onSlotsChange={onSlotsChange}
        />
      </Content>
    </Paper>
  )
}

const StyledComponent = styled(Component)`
  min-height: ${24 * 7}px;
  min-width: 400px;

  ${ShipHeader} svg {
    opacity: 0;
  }

  :hover ${ShipHeader} svg {
    opacity: 1;
  }
`

type ShipCardProps = {
  ship: EntityId
  onAdd: () => void
}

const ShipCard: React.FC<ShipCardProps> = ({ ship, onAdd }) => {
  const { actions, gears, openGearSelect, fhShip } = useShip(ship)

  const handleSlotsChange = React.useCallback((slots: number[]) => actions.update({ slots }), [actions])

  if (!fhShip) {
    return <Typography color="error">error</Typography>
  }

  return (
    <StyledComponent
      ship={fhShip}
      gears={gears}
      onAddGear={openGearSelect}
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

  return <ShipCard ship={ship} onAdd={onAdd} />
}

export default Container
