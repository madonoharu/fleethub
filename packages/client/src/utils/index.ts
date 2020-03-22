import { isNonNullable } from "../../../kcsim/src/utils"

let uidCount = 0
export const getUid = () => `${uidCount++}`

export type NullableArray<T> = Array<T | undefined>

export { isNonNullable }
