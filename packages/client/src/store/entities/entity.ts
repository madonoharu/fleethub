import { EntityId, nanoid } from "@reduxjs/toolkit"

export type Entity = { uid: EntityId }

export const selectId = (entity: Entity) => entity.uid

export const getUid = nanoid
