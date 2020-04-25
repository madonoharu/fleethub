import { GearBase } from "./MasterGear"
import { GearCategory, GearId } from "@fleethub/data"

export type ImprovementBonuses = {
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

  defensePowerBonus: number

  effectiveLosBonus: number
}

type FormulaType = "Sqrt" | "Linear"

export type ImprovementBonusFormula = { multiplier: number; type: FormulaType }

export type ImprovementData = Record<keyof ImprovementBonuses, ImprovementBonusFormula | undefined>

type FormulaCreator = (gear: GearBase) => ImprovementBonusFormula | undefined

const toSqrt = (multiplier: number): ImprovementBonusFormula => ({ multiplier, type: "Sqrt" })
const toLinear = (multiplier: number): ImprovementBonusFormula => ({ multiplier, type: "Linear" })

/**
 * @see https://t.co/Ou8KzFANPK
 * @see https://twitter.com/shiro_sh39/status/1103281372548878337
 */
const createContactSelectionBonus: FormulaCreator = (gear) => {
  const { category, los } = gear

  if (category === GearCategory.CbRecon) {
    // 二式艦偵 [0.25, 3) または√☆
    if (los === 7) return toLinear(0.25)

    // 景雲 (0.333..., 0.4]
    if (los === 11) return toLinear(0.4)
  }

  if (category === GearCategory.ReconSeaplane) {
    // 零観 (0.166..., 0.2]
    if (los === 6) return toLinear(0.2)

    // 零偵 Ro.43 (0.125, 0.1428...]
    if (los >= 4) return toLinear(0.14)

    // 夜偵 (0, 0.1]
    if (los === 3) return toLinear(0.1)
  }

  return undefined
}

/**
 * @see [陸攻](https://twitter.com/yukicacoon/status/1212566867933450241)
 */
const createFighterPowerBonus: FormulaCreator = (gear) => {
  if (gear.is("Fighter")) return toLinear(0.2)
  if (gear.is("FighterBomber")) return toLinear(0.25)
  if (gear.category === GearCategory.LbAttacker) return toSqrt(0.5)

  return undefined
}

const createAdjustedAntiAirBonus: FormulaCreator = ({ antiAir, category, is }) => {
  if (category === GearCategory.AntiAirGun) {
    const multiplier = antiAir <= 7 ? 4 : 6
    return toSqrt(multiplier)
  }
  if (category === GearCategory.AntiAirFireDirector || is("HighAngleMount")) {
    const multiplier = antiAir <= 7 ? 2 : 3
    return toSqrt(multiplier)
  }

  return undefined
}

const createFleetAntiAirBonus: FormulaCreator = ({ antiAir, is, category }) => {
  if (category === GearCategory.AntiAirFireDirector || is("HighAngleMount")) {
    const multiplier = antiAir <= 7 ? 2 : 3
    return toSqrt(multiplier)
  }
  if (is("AirRadar")) {
    const multiplier = 1.5
    return toSqrt(multiplier)
  }

  return undefined
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

const createShellingPowerBonus: FormulaCreator = ({ gearId, is, category, categoryIn, firepower }) => {
  if (firepower > 12) {
    return toSqrt(1.5)
  }

  if (category === GearCategory.CbTorpedoBomber) {
    return toLinear(0.2)
  }

  if (isTwinSecondaryGun(gearId)) {
    return toLinear(0.2)
  }

  if (isTripleSecondaryGun(gearId)) {
    return toLinear(0.3)
  }

  if (
    categoryIn(
      "SmallCaliberMainGun",
      "MediumCaliberMainGun",
      "LargeCaliberMainGun",
      "SecondaryGun",
      "ApShell",
      "AntiAirFireDirector",
      "Searchlight",
      "AntiAirGun",
      "LandingCraft",
      "LargeSearchlight",
      "SpecialAmphibiousTank",
      "AntiAirShell",
      "AntiGroundEquipment"
    )
  ) {
    return toSqrt(1)
  }

  if (categoryIn("Sonar", "LargeSonar") || is("DepthChargeProjector") || is("Mortar")) {
    return toSqrt(0.75)
  }

  return undefined
}

/**
 * @see [機銃は補正無し](http://jbbs.shitaraba.net/bbs/read.cgi/netgame/13745/1439793270/169)
 * @see [三式弾はありそう](https://twitter.com/CowardS_kan/status/1126877213511471104)
 */
const createShellingAccuracyBonus: FormulaCreator = ({ is, categoryIn }) => {
  if (is("SurfaceRadar")) {
    return toSqrt(1.7)
  }

  if (is("Radar") || is("MainGun") || categoryIn("SecondaryGun", "ApShell", "AntiAirShell", "AntiAirFireDirector")) {
    return toSqrt(1)
  }

  return undefined
}

const createAswPowerBonus: FormulaCreator = ({ category, categoryIn, asw }) => {
  if (category === GearCategory.CbTorpedoBomber) {
    return toLinear(0.2)
  }

  if (categoryIn("DepthCharge", "Sonar")) {
    return toSqrt(1)
  }

  if (category === GearCategory.Autogyro) {
    const multiplier = asw >= 11 ? 0.3 : 0.2
    return toLinear(multiplier)
  }

  return undefined
}

/**
 * 改式では爆雷投射機も1.3 * sqrt(☆)だが検証が見つからない
 */
const createAswAccuracyBonus: FormulaCreator = ({ categoryIn }) => {
  if (categoryIn("Sonar", "LargeSonar")) {
    return toSqrt(1.3)
  }

  return undefined
}

/**
 * 甲標的は補正無し
 */
const createTorpedoPowerBonus: FormulaCreator = ({ categoryIn }) => {
  if (categoryIn("Torpedo", "AntiAirGun")) {
    return toSqrt(1.2)
  }
  return undefined
}

/**
 * 特殊潜航艇の検証求む
 * @see [機銃は補正あり？](http://jbbs.shitaraba.net/bbs/read.cgi/netgame/13745/1439793270/169)
 */
const createTorpedoAccuracyBonus: FormulaCreator = ({ categoryIn }) => {
  if (categoryIn("Torpedo", "AntiAirGun")) {
    return toSqrt(2)
  }
  return undefined
}

const createTorpedoEvasionBonus: FormulaCreator = ({ categoryIn }) => {
  if (categoryIn("Sonar", "LargeSonar")) {
    return toSqrt(1.5)
  }

  return undefined
}

/**
 * 甲標的は補正あり
 * 15.2cm 三連装砲の検証が見つからないので調べる必要あり
 */
const createNightPowerBonus: FormulaCreator = ({ gearId, categoryIn }) => {
  if (isTwinSecondaryGun(gearId)) return toLinear(0.2)
  if (isTripleSecondaryGun(gearId)) return toLinear(0.3)

  if (
    categoryIn(
      "SmallCaliberMainGun",
      "MediumCaliberMainGun",
      "LargeCaliberMainGun",
      "SecondaryGun",
      "ApShell",
      "AntiAirShell",
      "Searchlight",
      "LargeSearchlight",
      "AntiAirFireDirector",
      "LandingCraft",
      "SpecialAmphibiousTank",
      "AntiGroundEquipment",
      "Torpedo",
      "MidgetSubmarine"
    )
  ) {
    return toSqrt(1)
  }

  return undefined
}

/**
 * ### 改式では
 *    水上電探 -> 1.6 * sqrt(☆)
 *    対空機銃, ソナー, 大型ソナー, 追加装甲, 追加装甲(中型), 追加装甲(大型), 機関部強化, 爆雷 -> 0
 *    その他 -> 1.3 * sqrt(☆)
 *
 * @see [中口径主砲は 1.3 * sqrt(☆)](https://docs.google.com/spreadsheets/d/1jYPuISDuAHsDOQbCGENTNx1TS5oeeoN_6Ltaf3or3SA)
 */
const createNightAccuracyBonus: FormulaCreator = ({ is, category }) => {
  if (is("SurfaceRadar")) {
    return toSqrt(1.6)
  }

  if (is("Radar") || category === GearCategory.MediumCaliberMainGun) {
    return toSqrt(1.3)
  }

  return undefined
}

const createDefensePowerBonus: FormulaCreator = ({ category }) => {
  if (category === GearCategory.MediumExtraArmor) {
    return toLinear(0.2)
  }
  if (category === GearCategory.LargeExtraArmor) {
    return toLinear(0.3)
  }
  return undefined
}

const createEffectiveLosBonus: FormulaCreator = ({ category, categoryIn }) => {
  if (category === GearCategory.SmallRadar) {
    return toSqrt(1.25)
  }

  if (category === GearCategory.LargeRadar) {
    return toSqrt(1.4)
  }

  if (categoryIn("CbRecon", "ReconSeaplane")) {
    return toSqrt(1.2)
  }

  if (category === GearCategory.SeaplaneBomber) {
    return toSqrt(1.15)
  }

  return undefined
}

export const createImprovementData = (gear: GearBase): ImprovementData => ({
  contactSelectionBonus: createContactSelectionBonus(gear),

  fighterPowerBonus: createFighterPowerBonus(gear),
  adjustedAntiAirBonus: createAdjustedAntiAirBonus(gear),
  fleetAntiAirBonus: createFleetAntiAirBonus(gear),

  shellingPowerBonus: createShellingPowerBonus(gear),
  shellingAccuracyBonus: createShellingAccuracyBonus(gear),

  aswPowerBonus: createAswPowerBonus(gear),
  aswAccuracyBonus: createAswAccuracyBonus(gear),

  torpedoPowerBonus: createTorpedoPowerBonus(gear),
  torpedoAccuracyBonus: createTorpedoAccuracyBonus(gear),
  torpedoEvasionBonus: createTorpedoEvasionBonus(gear),

  nightPowerBonus: createNightPowerBonus(gear),
  nightAccuracyBonus: createNightAccuracyBonus(gear),

  defensePowerBonus: createDefensePowerBonus(gear),

  effectiveLosBonus: createEffectiveLosBonus(gear),
})
