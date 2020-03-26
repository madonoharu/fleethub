import { EntityId } from "@reduxjs/toolkit"

export type Entity = { uid: EntityId }

export const selectId = (entity: Entity) => entity.uid

let uidCount = 0
export const getUid = () => `${uidCount++}`
