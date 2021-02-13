import React from "react"
import { Gear } from "@fleethub/sim"
import { GearState } from "@fleethub/utils"
import { EntityId } from "@reduxjs/toolkit"
import { EquipmentBonuses } from "equipment-bonus"

import { useGear, useModal } from "../../../hooks"

import GearList from "../../templates/GearList"

import GearBox from "../GearBox"

type Props = {
  id?: EntityId
  onSlotSizeChange?: (value: number) => void
  onGearChange?: (state: GearState) => void
  canEquip?: (gear: Gear) => boolean
  getNextEbonuses?: (gear: Gear) => EquipmentBonuses
}

const GearSlot: React.FCX<Props> = ({ id, onSlotSizeChange, onGearChange, canEquip, getNextEbonuses }) => {
  const { gear, entity } = useGear(id)
  const GearListModal = useModal()

  return (
    <div>
      <GearBox id={id} onGearChange={GearListModal.show} />

      <GearListModal full>
        <GearList
          onSelect={(g) => {
            onGearChange?.({ gear_id: g.gear_id })
            GearListModal.hide()
          }}
          canEquip={canEquip}
          getNextEbonuses={getNextEbonuses}
        />
      </GearListModal>
    </div>
  )
}

export default GearSlot
