import { FleetState } from "@fleethub/core"
import { createEntityAdapter, EntityId } from "@reduxjs/toolkit"

import { selectId, Entity } from "./entity"
import { FleetEntity } from "./fleets"
import { ShipEntity } from "./ships"
import { GearEntity } from "./gears"

export type PlanState = {
  name: string
  fleets: FleetState[]
}

export type PlanEntity = Entity & {
  name: string
  fleets: EntityId[]
}

export const plansAdapter = createEntityAdapter<PlanEntity>({ selectId })
