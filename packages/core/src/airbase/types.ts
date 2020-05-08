import { GearState, Gear } from "../gear"
import { NullableArray } from "../utils"

export type AirbaseState = {
  gears: NullableArray<GearState>
}

export type Airbase = {
  gears: NullableArray<Gear>
}
