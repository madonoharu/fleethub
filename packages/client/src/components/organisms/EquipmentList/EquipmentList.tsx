import React from "react"
import styled from "styled-components"
import { EquipmentState, Equipment, EquipmentKey, GearBase, EquipmentBonuses } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { Update } from "../../../utils"

import EquipmentListItem from "./EquipmentListItem"

type Props = {
  equipment: Equipment
  update: Update<EquipmentState>
}

const EquipmentList: React.FCX<Props> = ({ className, equipment, update }) => {
  return (
    <div className={className}>
      {equipment.items.map((item) => (
        <EquipmentListItem
          key={item.key}
          equipmentKey={item.key}
          gear={item.gear}
          currentSlotSize={item.currentSlotSize}
          maxSlotSize={item.maxSlotSize}
          updateEquipment={update}
        />
      ))}
    </div>
  )
}

export default styled(EquipmentList)`
  width: 100%;

  > * {
    height: 24px;
  }
`
