import { FleetState } from "@fleethub/core"
import { createEntityAdapter, EntityId } from "@reduxjs/toolkit"

import { selectId, Entity } from "./entity"

export type PlanState = {
  name: string
  fleets: FleetState[]
}

export type PlanEntity = Entity & {
  name: string
  fleets: EntityId[]
}

export const plansAdapter = createEntityAdapter<PlanEntity>({ selectId })
