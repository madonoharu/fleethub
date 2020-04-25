import { createImprovementBonusFormulas, ImprovementBonusFormula } from "./ImprovementBonusFormulas"

import { GearName, GearCategory, GearCategoryKey } from "@fleethub/data"

import { GearBaseStub } from "../utils/GearBaseStub"
import { makeGear } from "../utils/testUtils"
import { GearBase } from "./MasterGear"

describe("createImprovementBonusFormulas", () => {
  it("デフォルトの戻り値はundefined", () => {
    const gear = new GearBaseStub()
    expect(createImprovementBonusFormulas(gear)).toEqual<ReturnType<typeof createImprovementBonusFormulas>>({
      contactSelectionBonus: undefined,
      fighterPowerBonus: undefined,
      adjustedAntiAirBonus: undefined,
      fleetAntiAirBonus: undefined,
      shellingPowerBonus: undefined,
      shellingAccuracyBonus: undefined,
      aswPowerBonus: undefined,
      aswAccuracyBonus: undefined,
      torpedoPowerBonus: undefined,
      torpedoAccuracyBonus: undefined,
      torpedoEvasionBonus: undefined,
      nightPowerBonus: undefined,
      nightAccuracyBonus: undefined,
      effectiveLosBonus: undefined,
      defensePowerBonus: undefined,
    })
  })

  describe("contactSelectionBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementBonusFormulas(gear).contactSelectionBonus

    it.each<[GearName, number]>([
      ["二式艦上偵察機", 0.25],
      ["試製景雲(艦偵型)", 0.4],
      ["零式水上観測機", 0.2],
      ["零式水上偵察機", 0.14],
      ["Ro.43水偵", 0.14],
      ["九八式水上偵察機(夜偵)", 0.1],
    ])("%s -> %s * 改修値", (name, multiplier) => {
      const gear = makeGear(name)
      expect(toFormula(gear)).toEqual({ multiplier, type: "Linear" })
    })
  })

  describe("fighterPowerBonus ", () => {
    const toFormula = (gear: GearBase) => createImprovementBonusFormulas(gear).fighterPowerBonus

    it("戦闘機 -> 0.2 * 改修値", () => {
      const gear = GearBaseStub.fromAttrs("Fighter")
      expect(toFormula(gear)).toEqual({ multiplier: 0.2, type: "Linear" })
    })

    it("爆戦 -> 0.25 * 改修値", () => {
      const gear = GearBaseStub.fromAttrs("FighterBomber")
      expect(toFormula(gear)).toEqual({ multiplier: 0.25, type: "Linear" })
    })

    it("陸攻 -> 0.5 * sqrt(改修値)", () => {
      const gear = GearBaseStub.fromCategory("LbAttacker")
      expect(toFormula(gear)).toEqual({ multiplier: 0.5, type: "Sqrt" })
    })
  })

  describe("adjustedAntiAirBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementBonusFormulas(gear).adjustedAntiAirBonus

    it("対空8以上の対空機銃 -> 6 * sqrt(改修値)", () => {
      const gear = GearBaseStub.fromCategory("AntiAirGun")
      gear.antiAir = 8

      expect(toFormula(gear)).toEqual({ multiplier: 6, type: "Sqrt" })
    })

    it("対空7以下の対空機銃 -> 4 * sqrt(改修値)", () => {
      const gear = GearBaseStub.fromCategory("AntiAirGun")
      gear.antiAir = 7

      expect(toFormula(gear)).toEqual({ multiplier: 4, type: "Sqrt" })
    })

    it("対空8以上の高射装置,高角砲 -> 3 * sqrt(改修値)", () => {
      const aafd = GearBaseStub.fromCategory("AntiAirFireDirector")
      aafd.antiAir = 8
      expect(toFormula(aafd)).toEqual({ multiplier: 3, type: "Sqrt" })

      const ham = GearBaseStub.fromAttrs("HighAngleMount")
      ham.antiAir = 8
      expect(toFormula(ham)).toEqual({ multiplier: 3, type: "Sqrt" })
    })

    it("対空7以下の高射装置,高角砲 -> 2 * sqrt(改修値)", () => {
      const aafd = GearBaseStub.fromCategory("AntiAirFireDirector")
      aafd.antiAir = 7
      expect(toFormula(aafd)).toEqual({ multiplier: 2, type: "Sqrt" })

      const ham = GearBaseStub.fromAttrs("HighAngleMount")
      ham.antiAir = 7
      expect(toFormula(ham)).toEqual({ multiplier: 2, type: "Sqrt" })
    })
  })

  describe("fleetAntiAirBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementBonusFormulas(gear).fleetAntiAirBonus

    it("対空8以上の高射装置,高角砲 -> 3 * sqrt(改修値)", () => {
      const aafd = GearBaseStub.fromCategory("AntiAirFireDirector")
      aafd.antiAir = 8
      expect(toFormula(aafd)).toEqual({ multiplier: 3, type: "Sqrt" })

      const ham = GearBaseStub.fromAttrs("HighAngleMount")
      ham.antiAir = 8
      expect(toFormula(ham)).toEqual({ multiplier: 3, type: "Sqrt" })
    })

    it("対空7以下の高射装置,高角砲 -> 2 * sqrt(改修値)", () => {
      const aafd = GearBaseStub.fromCategory("AntiAirFireDirector")
      aafd.antiAir = 7
      expect(toFormula(aafd)).toEqual({ multiplier: 2, type: "Sqrt" })

      const ham = GearBaseStub.fromAttrs("HighAngleMount")
      ham.antiAir = 7
      expect(toFormula(ham)).toEqual({ multiplier: 2, type: "Sqrt" })
    })

    it("対空電探 -> 1.5 * sqrt(改修値)", () => {
      const gear = GearBaseStub.fromAttrs("AirRadar")
      expect(toFormula(gear)).toEqual({ multiplier: 1.5, type: "Sqrt" })
    })
  })

  describe("shellingPowerBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementBonusFormulas(gear).shellingPowerBonus

    it("火力13以上 -> 1.5 * sqrt(改修値)", () => {
      const fire12 = GearBaseStub.from({ firepower: 12 })
      const fire13 = GearBaseStub.from({ firepower: 13 })

      expect(toFormula(fire12)).toBe(undefined)
      expect(toFormula(fire13)).toEqual({ multiplier: 1.5, type: "Sqrt" })
    })

    it("艦攻 -> 0.2 * 改修値", () => {
      const gear = GearBaseStub.fromCategory("CbTorpedoBomber")
      expect(toFormula(gear)).toBe({ multiplier: 0.2, type: "Linear" })
    })

    it.each<GearName>(["12.7cm連装高角砲", "8cm高角砲", "8cm高角砲改+増設機銃", "10cm連装高角砲改+増設機銃"])(
      "%s -> 0.2 * 改修値",
      (name) => {
        const gear = makeGear(name)
        expect(toFormula(gear)).toBe({ multiplier: 0.2, type: "Linear" })
      }
    )

    it.each<GearName>(["15.5cm三連装副砲", "15.5cm三連装副砲改", "15.2cm三連装砲"])("%s -> 0.3 * 改修値", (name) => {
      const gear = makeGear(name)
      expect(toFormula(gear)).toBe({ multiplier: 0.3, type: "Linear" })
    })

    it("主砲, 副砲, 徹甲弾, 対空弾, 高射装置, 機銃, 探照灯, 大型探照灯, 対地装備, 上陸用舟艇, 内火艇 -> 1 * sqrt(改修値)", () => {
      const categories: GearCategoryKey[] = [
        "SmallCaliberMainGun",
        "MediumCaliberMainGun",
        "LargeCaliberMainGun",
        "SecondaryGun",
        "ApShell",
        "AntiAirShell",
        "AntiAirFireDirector",
        "AntiAirGun",
        "Searchlight",
        "LargeSearchlight",
        "AntiGroundEquipment",
        "LandingCraft",
        "SpecialAmphibiousTank",
      ]

      categories.forEach((category) => {
        const gear = GearBaseStub.fromCategory(category)
        expect(toFormula(gear)).toBe({ multiplier: 1, type: "Sqrt" })
      })
    })

    it("ソナー, 大型ソナー, 爆雷投射機, 迫撃砲 -> 0.75 * sqrt(改修値)", () => {
      const sonor = GearBaseStub.fromCategory("Sonar")
      const largeSonar = GearBaseStub.fromCategory("LargeSonar")
      const depthChargeProjector = GearBaseStub.fromAttrs("DepthChargeProjector")
      const mortar = GearBaseStub.fromAttrs("Mortar")

      ;[sonor, largeSonar, depthChargeProjector, mortar].forEach((gear) => {
        expect(toFormula(gear)).toBe({ multiplier: 0.75, type: "Sqrt" })
      })
    })
  })

  describe("shellingAccuracyBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementBonusFormulas(gear).shellingAccuracyBonus

    it("水上電探 -> 1.7 * sqrt(改修値)", () => {
      const gear = GearBaseStub.fromAttrs("SurfaceRadar")
      expect(toFormula(gear)).toEqual({ multiplier: 1.7, type: "Sqrt" })
    })

    it("電探, 徹甲弾, 対空弾, 高射装置 -> 1 * sqrt(改修値)", () => {
      const radar = GearBaseStub.fromAttrs("Radar")
      const aps = GearBaseStub.fromCategory("ApShell")
      const aas = GearBaseStub.fromCategory("AntiAirShell")
      const aafd = GearBaseStub.fromCategory("AntiAirFireDirector")

      ;[radar, aps, aas, aafd].forEach((gear) => {
        expect(toFormula(gear)).toEqual({ multiplier: 1, type: "Sqrt" })
      })
    })
  })

  describe("aswPowerBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementBonusFormulas(gear).aswPowerBonus

    it("艦攻 -> 0.2 * 改修値", () => {
      const gear = GearBaseStub.fromCategory("CbTorpedoBomber")
      expect(toFormula(gear)).toEqual({ multiplier: 0.2, type: "Linear" })
    })

    it("爆雷, ソナー -> 1 * 改修値", () => {
      const depthCharge = GearBaseStub.fromCategory("DepthCharge")
      expect(toFormula(depthCharge)).toEqual({ multiplier: 1, type: "Sqrt" })

      const sonor = GearBaseStub.fromCategory("Sonar")
      expect(toFormula(sonor)).toEqual({ multiplier: 1, type: "Sqrt" })
    })

    it("対潜10以下のオートジャイロ -> 0.2 * 改修値", () => {
      const autogyro = GearBaseStub.fromCategory("Autogyro")
      autogyro.asw = 10
      expect(toFormula(autogyro)).toEqual({ multiplier: 0.2, type: "Linear" })
    })

    it("対潜11以上のオートジャイロ -> 0.3 * 改修値", () => {
      const autogyro = GearBaseStub.fromCategory("Autogyro")
      autogyro.asw = 11
      expect(toFormula(autogyro)).toEqual({ multiplier: 0.3, type: "Linear" })
    })
  })

  describe("aswAccuracyBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementBonusFormulas(gear).aswAccuracyBonus

    it("ソナー, 大型ソナー -> 1.3 * sqrt(改修値)", () => {
      const sonar = GearBaseStub.fromCategory("Sonar")
      expect(toFormula(sonar)).toEqual({ multiplier: 1.3, type: "Sqrt" })

      const largeSonar = GearBaseStub.fromCategory("LargeSonar")
      expect(toFormula(largeSonar)).toEqual({ multiplier: 1.3, type: "Sqrt" })
    })
  })

  describe("torpedoPowerBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementBonusFormulas(gear).torpedoPowerBonus

    it("魚雷, 機銃 -> 1.2 * sqrt(改修値)", () => {
      const torpedo = GearBaseStub.fromCategory("Torpedo")
      expect(toFormula(torpedo)).toEqual({ multiplier: 1.2, type: "Sqrt" })

      const aaGun = GearBaseStub.fromCategory("AntiAirGun")
      expect(toFormula(aaGun)).toEqual({ multiplier: 1.2, type: "Sqrt" })
    })
  })

  describe("torpedoAccuracyBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementBonusFormulas(gear).torpedoAccuracyBonus

    it("魚雷, 機銃 -> 2 * sqrt(改修値)", () => {
      const torpedo = GearBaseStub.fromCategory("Torpedo")
      expect(toFormula(torpedo)).toEqual({ multiplier: 2, type: "Sqrt" })

      const aaGun = GearBaseStub.fromCategory("AntiAirGun")
      expect(toFormula(aaGun)).toEqual({ multiplier: 2, type: "Sqrt" })
    })
  })

  describe("torpedoAccuracyBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementBonusFormulas(gear).torpedoEvasionBonus

    it("ソナー, 大型ソナー -> 1.5 * sqrt(改修値)", () => {
      const expected: ImprovementBonusFormula = { multiplier: 1.5, type: "Sqrt" }

      const sonar = GearBaseStub.fromCategory("Sonar")
      expect(toFormula(sonar)).toEqual(expected)
      const largeSonar = GearBaseStub.fromCategory("LargeSonar")
      expect(toFormula(largeSonar)).toEqual(expected)
    })
  })
})
