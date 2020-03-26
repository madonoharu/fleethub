import { createEntityAdapter, EntitySelectors } from "@reduxjs/toolkit"
import { GearState } from "@fleethub/kcsim"

import { Entity, selectId, getUid } from "./entity"

export type GearEntity = Entity & GearState

export const gearToEntity = (state: GearState): GearEntity => {
  return { uid: getUid(), ...state }
}

export const gearsAdapter = createEntityAdapter<GearEntity>({ selectId })

export const gearsSelectors: EntitySelectors<GearEntity> = gearsAdapter.getSelectors((state) => state.entities.gears)
