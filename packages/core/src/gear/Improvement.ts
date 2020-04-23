import { GearBase } from "./MasterGear"
import { GearAttribute } from "./GearAttribute"
import { GearCategory, GearId } from "@fleethub/data"

type CalculationMethod = number | "average" | "sum"

export type Improvement = {
  contactSelectionBonus: number

  fighterPowerBonus: number
  adjustedAntiAirBonus: number
  fleetAntiAirBonus: number

  shellingPowerBonus: number
  shellingAccuracyBonus: number

  aswPowerBonus: number
  aswAccuracyBonus: number

  torpedoPowerBonus: number
  torpedoAccuracyBonus: number
  torpedoEvasionBonus: number

  nightPowerBonus: number
  nightAccuracyBonus: number

  effectiveLosBonus: number
  defensePowerBonus: number
}

type GearParams = Pick<GearBase, "gearId" | "category" | "is" | "firepower" | "antiAir" | "los">

type ImprovementBonusCalculator = (gear: GearBase, stars: number) => number

/**
 * @see https://t.co/Ou8KzFANPK
 * @see https://twitter.com/shiro_sh39/status/1103281372548878337
 */
const calcContactSelectionBonus: ImprovementBonusCalculator = (gear, stars) => {
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

/**
 * @see https://twitter.com/yukicacoon/status/1212566867933450241
 */
const calcFighterPowerBonus: ImprovementBonusCalculator = (gear, stars) => {
  if (gear.is("Fighter")) return 0.2 * stars
  if (gear.is("FighterBomber")) return 0.25 * stars
  if (gear.category === GearCategory.LandBasedAttackAircraft) return 0.5 * Math.sqrt(stars)

  return 0
}

/**
 * @see  https://twitter.com/CitrusJ9N/status/1056224720712921088
 */
const calcAdjustedAntiAirBonus: ImprovementBonusCalculator = (gear, stars) => {
  const { antiAir, category } = gear
  if (antiAir === 0) {
    return 0
  }

  let multiplier = 0
  if (category === GearCategory.AntiAircraftGun) {
    multiplier = antiAir <= 7 ? 4 : 6
  } else if (category === GearCategory.AntiAircraftFireDirector || gear.is("HighAngleMount")) {
    multiplier = antiAir <= 7 ? 2 : 3
  }
  return multiplier * Math.sqrt(stars)
}

const calcFleetAntiAirBonus = ({ antiAir, is, category }: GearParams, stars: number) => {
  if (antiAir === 0) {
    return 0
  }
  // 装備定数B
  let multiplier = 0
  if (category === GearCategory.AntiAircraftFireDirector || is("HighAngleMount")) {
    multiplier = antiAir <= 7 ? 2 : 3
  } else if (is("AirRadar")) {
    multiplier = 1.5
  }
  return multiplier * Math.sqrt(stars)
}

const calcShellingPowerBonus: ImprovementBonusCalculator = ({ gearId, is, category, categoryIn, firepower }, stars) => {
  if (firepower > 12) {
    return 1.5 * Math.sqrt(stars)
  }

  if (category === GearCategory.CarrierBasedTorpedoBomber) {
    return 0.2 * stars
  }

  if (
    [
      GearId["12.7cm連装高角砲"],
      GearId["8cm高角砲"],
      GearId["8cm高角砲改+増設機銃"],
      GearId["10cm連装高角砲改+増設機銃"],
    ].includes(gearId)
  ) {
    return 0.2 * stars
  }

  if ([GearId["15.5cm三連装副砲"], GearId["15.5cm三連装副砲改"], GearId["15.2cm三連装砲"]].includes(gearId)) {
    return 0.3 * stars
  }

  if (
    categoryIn(
      "SmallCaliberMainGun",
      "MediumCaliberMainGun",
      "LargeCaliberMainGun",
      "SecondaryGun",
      "ArmorPiercingShell",
      "AntiAircraftFireDirector",
      "Searchlight",
      "AntiAircraftGun",
      "LandingCraft",
      "SpecialAmphibiousTank",
      "AntiAircraftShell",
      "AntiGroundEquipment"
    )
  ) {
    return Math.sqrt(stars)
  }

  if (categoryIn("Sonar", "LargeSonar") || is("DepthChargeProjector") || is("Mortar")) {
    return 0.75 * Math.sqrt(stars)
  }

  return 0
}

export const createImprovement = (gear: GearBase, stars: number) => ({
  contactSelectionBonus: calcContactSelectionBonus(gear, stars),

  fighterPowerBonus: calcFighterPowerBonus(gear, stars),
  adjustedAntiAirBonus: calcAdjustedAntiAirBonus(gear, stars),
  fleetAntiAirBonus: calcFleetAntiAirBonus(gear, stars),
  shellingPowerBonus: calcShellingPowerBonus(gear, stars),
})
