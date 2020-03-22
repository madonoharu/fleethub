import { createEntityAdapter, EntitySelectors, EntityId } from "@reduxjs/toolkit"
import { getUid } from "../../utils"

export type GearState = {
  gearId: number
  stars?: number
  exp?: number
}

export type GearEntity = {
  uid: EntityId

  gearId: number
  stars: number
  exp: number
}

export const gearToEntity = ({ gearId, stars = 0, exp = 0 }: GearState): GearEntity => {
  return { uid: getUid(), gearId, stars, exp }
}

export const gearsAdapter = createEntityAdapter<GearEntity>({
  selectId: (gear) => gear.uid,
})

export const gearsSelectors: EntitySelectors<GearEntity> = gearsAdapter.getSelectors((state) => state.entities.gears)
