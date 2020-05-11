import { GearState, Gear } from "../gear"
import { NullableArray } from "../utils"
import { EquipmentState, Equipment } from "../equipment"

export type AirbaseState = EquipmentState

export type Airbase = {
  equipment: Equipment
}
