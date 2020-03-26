import { gears, ships } from "@fleethub/data"
import KcsimFactory from "./KcsimFactory"

export const kcsimFactory = new KcsimFactory({ gears, ships })

export * from "./ship"
export * from "./gear"
export * from "./utils"
