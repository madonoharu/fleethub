import React from "react"
import styled from "styled-components"
import { EntityId } from "@reduxjs/toolkit"
import { Ship } from "@fleethub/core"

import { Box, Paper } from "@material-ui/core"

import { EquipmentSlotList, ShipBanner } from "../../../components"

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

type Props = {
  ship: Ship
  gears: NullableArray<EntityId>
  onAddGear: (index: number) => void
  onRemove: () => void
  onUpdate: (changes: Partial<ShipEntity>) => void
  onSlotsChange: (slots: number[]) => void
}

const ShipCard: React.FCX<Props> = ({ className, ship, gears, onAddGear, onUpdate, onRemove, onSlotsChange }) => {
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

        <EquipmentSlotList
          currentSlots={ship.equipment.currentSlots}
          initalSlots={ship.equipment.defaultSlots}
          gears={gears}
          onAdd={onAddGear}
          onSlotsChange={onSlotsChange}
        />
      </Content>
    </Paper>
  )
}

export default styled(ShipCard)`
  min-height: ${24 * 7}px;
  min-width: 400px;

  ${ShipHeader} svg {
    opacity: 0;
  }

  :hover ${ShipHeader} svg {
    opacity: 1;
  }
`
