import { GearBase } from "./MasterGear"
import { GearCategory, GearId } from "@fleethub/data"

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

type ImprovementBonusCalculator = (gear: GearBase, stars: number) => number

/**
 * @see https://t.co/Ou8KzFANPK
 * @see https://twitter.com/shiro_sh39/status/1103281372548878337
 */
const calcContactSelectionBonus: ImprovementBonusCalculator = (gear, stars) => {
  const { category, los } = gear

  if (category === GearCategory.CbRecon) {
    // 二式艦偵 [0.25, 3) または√☆
    if (los === 7) return 0.25 * stars

    // 景雲 (0.333..., 0.4]
    if (los === 11) return 0.4 * stars
  }

  if (category === GearCategory.ReconSeaplane) {
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
const calcAdjustedAntiAirBonus: ImprovementBonusCalculator = ({ antiAir, category, is }, stars) => {
  let multiplier = 0
  if (category === GearCategory.AntiAircraftGun) {
    multiplier = antiAir <= 7 ? 4 : 6
  }
  if (category === GearCategory.AntiAircraftFireDirector || is("HighAngleMount")) {
    multiplier = antiAir <= 7 ? 2 : 3
  }

  return multiplier * Math.sqrt(stars)
}

const calcFleetAntiAirBonus: ImprovementBonusCalculator = ({ antiAir, is, category }, stars) => {
  let multiplier = 0
  if (category === GearCategory.AntiAircraftFireDirector || is("HighAngleMount")) {
    multiplier = antiAir <= 7 ? 2 : 3
  }
  if (is("AirRadar")) {
    multiplier = 1.5
  }

  return multiplier * Math.sqrt(stars)
}

const isTwinSecondaryGun = (gearId: number) =>
  [
    GearId["12.7cm連装高角砲"],
    GearId["8cm高角砲"],
    GearId["8cm高角砲改+増設機銃"],
    GearId["10cm連装高角砲改+増設機銃"],
  ].includes(gearId)

const isTripleSecondaryGun = (gearId: number) =>
  [GearId["15.5cm三連装副砲"], GearId["15.5cm三連装副砲改"], GearId["15.2cm三連装砲"]].includes(gearId)

const calcShellingPowerBonus: ImprovementBonusCalculator = ({ gearId, is, category, categoryIn, firepower }, stars) => {
  if (firepower > 12) {
    return 1.5 * Math.sqrt(stars)
  }

  if (category === GearCategory.CbTorpedoBomber) {
    return 0.2 * stars
  }

  if (isTwinSecondaryGun(gearId)) {
    return 0.2 * stars
  }

  if (isTripleSecondaryGun(gearId)) {
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
      "LargeSearchlight",
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

/**
 * @see [機銃は補正無し](http://jbbs.shitaraba.net/bbs/read.cgi/netgame/13745/1439793270/169)
 * @see [三式弾はありそう](https://twitter.com/CowardS_kan/status/1126877213511471104)
 */
const calcShellingAccuracyBonus: ImprovementBonusCalculator = ({ is, categoryIn }, stars) => {
  if (is("SurfaceRadar")) {
    return 1.7 * Math.sqrt(stars)
  }

  if (
    is("Radar") ||
    is("MainGun") ||
    categoryIn("SecondaryGun", "ArmorPiercingShell", "AntiAircraftShell", "AntiAircraftFireDirector")
  ) {
    return Math.sqrt(stars)
  }

  return 0
}

const calcAswPowerBonus: ImprovementBonusCalculator = ({ category, categoryIn, asw }, stars) => {
  if (category === GearCategory.CbTorpedoBomber) {
    return 0.2 * stars
  }

  if (categoryIn("DepthCharge", "Sonar")) {
    return Math.sqrt(stars)
  }

  if (category === GearCategory.Autogyro) {
    const multiplier = asw >= 11 ? 0.3 : 0.2
    return multiplier * stars
  }

  return 0
}

/**
 * 改式では爆雷投射機も1.3 * sqrt(☆)だが検証が見つからない
 */
const calcAswAccuracyBonus: ImprovementBonusCalculator = ({ categoryIn }, stars) => {
  if (categoryIn("Sonar", "LargeSonar")) {
    return 1.3 * Math.sqrt(stars)
  }

  return 0
}

/**
 * 甲標的は補正無し
 */
const calcTorpedoPowerBonus: ImprovementBonusCalculator = ({ categoryIn }, stars) => {
  if (categoryIn("Torpedo", "AntiAircraftGun")) {
    return 1.2 * Math.sqrt(stars)
  }
  return 0
}

/**
 * 特殊潜航艇の検証求む
 * @see [機銃は補正あり？](http://jbbs.shitaraba.net/bbs/read.cgi/netgame/13745/1439793270/169)
 */
const calcTorpedoAccuracyBonus: ImprovementBonusCalculator = ({ categoryIn }, stars) => {
  if (categoryIn("Torpedo", "AntiAircraftGun")) {
    return 1.2 * Math.sqrt(stars)
  }
  return 0
}

const calcTorpedoEvasionBonus: ImprovementBonusCalculator = ({ categoryIn }, stars) => {
  if (categoryIn("Sonar", "LargeSonar")) {
    return 1.5 * Math.sqrt(stars)
  }

  return 0
}

/**
 * 甲標的は補正あり
 * 15.2cm 三連装砲の検証が見つからないので調べる必要あり
 */
const calcNightPowerBonus: ImprovementBonusCalculator = ({ gearId, categoryIn }, stars) => {
  if (isTwinSecondaryGun(gearId)) return 0.2 * stars
  if (isTripleSecondaryGun(gearId)) return 0.3 * stars

  if (
    categoryIn(
      "SmallCaliberMainGun",
      "MediumCaliberMainGun",
      "LargeCaliberMainGun",
      "SecondaryGun",
      "ArmorPiercingShell",
      "AntiAircraftShell",
      "Searchlight",
      "LargeSearchlight",
      "AntiAircraftFireDirector",
      "LandingCraft",
      "SpecialAmphibiousTank",
      "AntiGroundEquipment",
      "Torpedo",
      "MidgetSubmarine"
    )
  ) {
    return Math.sqrt(stars)
  }

  return 0
}

/**
 * ### 改式では
 *    水上電探 -> 1.6 * sqrt(☆)
 *    対空機銃, ソナー, 大型ソナー, 追加装甲, 追加装甲(中型), 追加装甲(大型), 機関部強化, 爆雷 -> 0
 *    その他 -> 1.3 * sqrt(☆)
 *
 * @see [中口径主砲は 1.3 * sqrt(☆)](https://docs.google.com/spreadsheets/d/1jYPuISDuAHsDOQbCGENTNx1TS5oeeoN_6Ltaf3or3SA)
 */
const calcNightAccuracyBonus: ImprovementBonusCalculator = ({ is, category }, stars) => {
  if (is("SurfaceRadar")) {
    return 1.6 * Math.sqrt(stars)
  }

  if (is("Radar") || category === GearCategory.MediumCaliberMainGun) {
    return 1.3 * Math.sqrt(stars)
  }

  return 0
}

const calEffectiveLosBonus: ImprovementBonusCalculator = ({ category, categoryIn }, stars) => {
  if (category === GearCategory.SmallRadar) {
    return 1.25 * Math.sqrt(stars)
  }

  if (category === GearCategory.LargeRadar) {
    return 1.4 * Math.sqrt(stars)
  }

  if (categoryIn("CbRecon", "ReconSeaplane")) {
    return 1.2 * Math.sqrt(stars)
  }

  if (category === GearCategory.SeaplaneBomber) {
    return 1.15 * Math.sqrt(stars)
  }

  return 0
}

const calcDefensePowerBonus: ImprovementBonusCalculator = ({ category }, stars) => {
  if (category === GearCategory.MediumExtraArmor) {
    return 0.2 * stars
  }
  if (category === GearCategory.LargeExtraArmor) {
    return 0.3 * stars
  }
  return 0
}

export const createImprovement = (gear: GearBase, stars: number): Improvement => ({
  contactSelectionBonus: calcContactSelectionBonus(gear, stars),

  fighterPowerBonus: calcFighterPowerBonus(gear, stars),
  adjustedAntiAirBonus: calcAdjustedAntiAirBonus(gear, stars),
  fleetAntiAirBonus: calcFleetAntiAirBonus(gear, stars),

  shellingPowerBonus: calcShellingPowerBonus(gear, stars),
  shellingAccuracyBonus: calcShellingAccuracyBonus(gear, stars),

  aswPowerBonus: calcAswPowerBonus(gear, stars),
  aswAccuracyBonus: calcAswAccuracyBonus(gear, stars),

  torpedoPowerBonus: calcTorpedoPowerBonus(gear, stars),
  torpedoAccuracyBonus: calcTorpedoAccuracyBonus(gear, stars),
  torpedoEvasionBonus: calcTorpedoEvasionBonus(gear, stars),

  nightPowerBonus: calcNightPowerBonus(gear, stars),
  nightAccuracyBonus: calcNightAccuracyBonus(gear, stars),

  effectiveLosBonus: calEffectiveLosBonus(gear, stars),

  defensePowerBonus: calcDefensePowerBonus(gear, stars),
})
