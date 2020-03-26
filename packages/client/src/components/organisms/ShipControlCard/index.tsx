import React from "react"
import styled from "styled-components"
import { EntityId } from "@reduxjs/toolkit"
import { Ship } from "@fleethub/kcsim"

import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"
import Box from "@material-ui/core/Box"
import Paper from "@material-ui/core/Paper"

import { useShip } from "../../../hooks"
import { EquipmentControl, ShipBanner, UpdateButton, ClearButton, InfoButton } from "../../../components"
import { NullableArray } from "../../../utils"
import { ShipEntity } from "../../../store"

import LevelButton from "./LevelButton"
import StatLabel from "./StatLabel"
import ShipStats from "./ShipStats"

const IconButtonGroup = styled.div`
  display: flex;
  justify-content: end;
`

const Name = styled(Typography)``

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

const AddShipButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button variant="outlined" onClick={onClick}>
      add ship
    </Button>
  )
}

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
      <Box ml={1} display="flex" justifyContent="space-between">
        <Name variant="subtitle2" noWrap>
          {ship.name}
        </Name>
        <IconButtonGroup>
          <InfoButton size="small" />
          <UpdateButton size="small" />
          <ClearButton size="small" onClick={onRemove} />
        </IconButtonGroup>
      </Box>

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

  ${IconButtonGroup} {
    opacity: 0;
  }

  :hover {
    ${IconButtonGroup} {
      opacity: 1;
    }
  }
`

type ShipCardProps = {
  ship: EntityId
  onAdd: () => void
}

const ShipCard: React.FC<ShipCardProps> = ({ ship, onAdd }) => {
  const { entity, actions, gears, openGearSelect, kcShip } = useShip(ship)

  const handleSlotsChange = (slots: number[]) => actions.update({ slots })

  if (!kcShip) {
    return <Typography color="error">error</Typography>
  }

  return (
    <StyledComponent
      ship={kcShip}
      gears={gears}
      onAddGear={openGearSelect}
      onSlotsChange={handleSlotsChange}
      onUpdate={actions.update}
      onRemove={actions.remove}
    />
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
