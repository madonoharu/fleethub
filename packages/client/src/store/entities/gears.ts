import { createEntityAdapter } from "@reduxjs/toolkit"
import { GearState } from "@fleethub/core"

import { Entity, selectId } from "./entity"

export type GearEntity = Entity & GearState

export const gearsAdapter = createEntityAdapter<GearEntity>({ selectId })
