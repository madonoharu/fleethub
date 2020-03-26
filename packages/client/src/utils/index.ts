import { isNonNullable } from "@fleethub/kcsim"

let uidCount = 0
export const getUid = () => `${uidCount++}`

export type NullableArray<T> = import("@fleethub/kcsim").NullableArray<T>
export { isNonNullable }
