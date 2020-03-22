import React from "react"
import styled from "styled-components"
import { EntityId } from "@reduxjs/toolkit"

import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"
import Box from "@material-ui/core/Box"
import Paper from "@material-ui/core/Paper"

import { useShip } from "../../../hooks"
import { EquipmentControl, ShipBanner, ClearButton } from "../../../components"
import { NullableArray } from "../../../utils"
import { ShipEntity } from "../../../store"

const AddShipButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return <Button onClick={onClick}>add ship</Button>
}

type ComponentProps = {
  className?: string
  entity: ShipEntity
  gears: NullableArray<EntityId>
  onAddGear: (index: number) => void
  onRemove: () => void
}

const Component: React.FC<ComponentProps> = ({ className, entity, gears, onAddGear, onRemove }) => {
  return (
    <Paper className={className}>
      <Box>
        <Typography variant="subtitle2">{entity.shipId} 艦娘名艦娘名</Typography>

        <ShipBanner shipId={entity.shipId} />
      </Box>

      <Box>
        <ClearButton style={{ marginLeft: "auto", display: "flex" }} size="small" onClick={onRemove} />
        <EquipmentControl slots={[]} gears={gears} onAdd={onAddGear} />
      </Box>
    </Paper>
  )
}

const StyledComponent = styled(Component)`
  display: flex;
  height: ${24 * 7}px;
  min-width: 400px;

  > * {
    min-width: 0;
  }
  > :first-child {
    margin: 0 8px;
    width: 152px;
    flex-shrink: 0;
  }
  > :last-child {
    width: 100%;
  }
`

type ShipCardProps = {
  ship: EntityId
  onAdd: () => void
}

const ShipCard: React.FC<ShipCardProps> = ({ ship, onAdd }) => {
  const { entity, actions, gears, openGearSelect } = useShip(ship)

  if (!entity) {
    return <AddShipButton onClick={onAdd} />
  }

  return <StyledComponent entity={entity} gears={gears} onAddGear={openGearSelect} onRemove={actions.remove} />
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
