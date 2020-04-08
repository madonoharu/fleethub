import { GearBase } from "./MasterGear"
import { GearAttribute } from "./GearAttribute"
import { GearCategory } from "@fleethub/data"

type CalculationMethod = number | "average" | "sum"

type AttackModifiers = {
  power: number
  accuracy: number
  evasion: number
}

type CombatModifiers = {
  shelling: AttackModifiers
  asw: AttackModifiers
  torpedo: AttackModifiers
  night: AttackModifiers
}

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

  nightPowerModifier: number
  nightAccuracyModifier: number

  effectiveLosModifier: number
  defensePowerModifier: number
}

export default class Improvement {
  constructor(private gear: GearBase, private stars: number) {}
}
