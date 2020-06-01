import { GearState, Gear, GearBase } from "../gear"
import { NullableArray } from "../utils"
import { EquipmentState, Equipment } from "../equipment"

export type AirbaseState = EquipmentState

export type Airbase = {
  equipment: Equipment
  canEquip: (gear: GearBase) => boolean
}
