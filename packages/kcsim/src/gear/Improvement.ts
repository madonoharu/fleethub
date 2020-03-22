import { GearBase } from "./MasterGear"
import { GearAttribute } from "./GearAttribute"
import { GearCategory } from "@fleethub/data"

export type ImprovementModifiers = {
  contactSelectionModifier: number

  fighterPowerModifier: number
  adjustedAntiAirModifier: number
  fleetAntiAirModifier: number

  shellingPowerModifier: number
  shellingAccuracyModifier: number

  aswPowerModifier: number
  aswAccuracyModifier: number

  torpedoPowerModifier: number
  torpedoAccuracyModifier: number
  torpedoEvasionModifier: number

  nightAttackPowerModifier: number
  nightAttackAccuracyModifier: number

  effectiveLosModifier: number
  defensePowerModifier: number
}

export default class Improvement {
  constructor(private gear: GearBase, private star: number) {}
}
