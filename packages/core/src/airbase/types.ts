import { GearBase } from "../gear"
import { EquipmentState, Equipment } from "../equipment"

type AirbaseMode = "Sortie" | "AirDefense" | "Standby"

export type AirbaseState = EquipmentState & {
  mode?: AirbaseMode
}

export type Airbase = {
  state: AirbaseState
  mode: AirbaseMode

  equipment: Equipment
  canEquip: (gear: GearBase) => boolean
  radius: number
  fighterPower: number
  interceptionPower: number
  highAltitudeInterceptorCount: number
}
