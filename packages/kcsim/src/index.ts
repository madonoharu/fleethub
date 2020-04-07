import { gears, ships } from "@fleethub/data"

import KcsimFactory from "./KcsimFactory"
import Kcsim from "./Kcsim"

const kcsimFactory = new KcsimFactory({ gears, ships })
export const kcsim = new Kcsim(kcsimFactory)

export * from "./ship"
export * from "./gear"
export * from "./utils"
