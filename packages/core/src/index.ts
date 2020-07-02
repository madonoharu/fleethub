import { gears, ships } from "@fleethub/data"

import Factory from "./Factory"
import FhSystem from "./FhSystem"

const factory = new Factory({ gears, ships })
export const fhSystem = new FhSystem(factory)

export * from "./ship"
export * from "./gear"
export * from "./equipment"
export * from "./fleet"
export * from "./airbase"
export * from "./enemy"
export * from "./plan"
export * from "./common"
export * from "./attacks"
export * from "./utils"

export { ShipClass, ShipClassKey, ShipType, HullCode } from "@fleethub/data"
