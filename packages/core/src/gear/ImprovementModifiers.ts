import { GearBase } from "./MasterGear"
import { GearAttribute } from "./GearAttribute"
import { GearCategory, GearId } from "@fleethub/data"

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

type GearParams = Pick<GearBase, "gearId" | "category" | "is" | "antiAir" | "los">

/**
 * https://t.co/Ou8KzFANPK
 * https://twitter.com/shiro_sh39/status/1103281372548878337
 *
 */
const calcContactSelectionModifier = (gear: GearParams, stars: number) => {
  const { category, los } = gear

  if (category === GearCategory.CarrierBasedReconnaissanceAircraft) {
    // 二式艦偵 [0.25, 3) または√☆
    if (los === 7) return 0.25 * stars

    // 景雲 (0.333..., 0.4]
    if (los === 11) return 0.4 * stars
  }

  if (category === GearCategory.ReconnaissanceSeaplane) {
    // 零観 (0.166..., 0.2]
    if (los === 6) return 0.2 * stars

    // 零偵 Ro.43 (0.125, 0.1428...]
    if (los >= 4) return 0.14 * stars

    // 夜偵 (0, 0.1]
    if (los === 3) return 0.1 * stars
  }

  return 0
}

const calcFighterPowerModifier = (gear: GearParams, stars: number) => {
  if (gear.antiAir === 0) {
    return 0
  }
  // 装備定数B
  let multiplier = 0

  if (gear.category === GearCategory.AntiAircraftFireDirector || gear.is("HighAngleMount")) {
    multiplier = gear.antiAir <= 7 ? 2 : 3
  } else if (gear.is("AirRadar")) {
    multiplier = 1.5
  }

  return multiplier * Math.sqrt(stars)
}

const calcAdjustedAntiAirModifier = (gear: GearParams, stars: number) => {
  const { antiAir, category } = gear
  if (antiAir === 0) {
    return 0
  }

  let multiplier = 0
  if (category === GearCategory.AntiAircraftGun) {
    // https://twitter.com/CitrusJ9N/status/1056224720712921088
    multiplier = antiAir <= 7 ? 4 : 6
  } else if (category === GearCategory.AntiAircraftFireDirector || gear.is("HighAngleMount")) {
    multiplier = antiAir <= 7 ? 2 : 3
  }
  return multiplier * Math.sqrt(stars)
}

export const createImprovementModifiers = (gear: GearParams, stars: number) => ({
  contactSelection: calcContactSelectionModifier(gear, stars),

  fighterPower: calcFighterPowerModifier(gear, stars),
  adjustedAntiAir: calcAdjustedAntiAirModifier(gear, stars),
})
