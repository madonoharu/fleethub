import React from "react"
import styled from "styled-components"
import { EquipmentState, Equipment } from "@fleethub/core"

import { Update } from "../../../utils"

import EquipmentListItem, { Props as EquipmentListItemProps } from "./EquipmentListItem"

type Props = {
  equipment: Equipment
  update: Update<EquipmentState>
} & Pick<EquipmentListItemProps, "canEquip" | "makeGetNextBonuses">

const EquipmentList: React.FCX<Props> = ({ className, equipment, update, canEquip, makeGetNextBonuses }) => {
  return (
    <div className={className}>
      {equipment.items.map((item) => (
        <EquipmentListItem
          key={item.key}
          gearKey={item.key}
          gear={item.gear}
          currentSlotSize={item.currentSlotSize}
          maxSlotSize={item.maxSlotSize}
          updateEquipment={update}
          canEquip={canEquip}
          makeGetNextBonuses={makeGetNextBonuses}
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
