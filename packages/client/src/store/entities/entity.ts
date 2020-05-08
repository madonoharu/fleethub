import { EntityId } from "@reduxjs/toolkit"

export type Entity = { id: EntityId }

export const selectId = (entity: Entity) => entity.id
