import { GearState, Gear } from "../gear"
import { NullableArray } from "../utils"

export type AirbaseState = {
  gears: NullableArray<GearState>
  slots: number[]
}

export type Airbase = {
  gears: NullableArray<Gear>
}
