import { createImprovementData, ImprovementBonusFormula } from "./ImprovementData"

import { GearName, GearCategoryName } from "@fleethub/data"

import { GearBaseStub } from "../utils"
import { makeGear } from "../utils/testUtils"

import { GearBase } from "./MasterGear"

describe("createImprovementData", () => {
  it("デフォルトの戻り値はundefined", () => {
    const gear = new GearBaseStub()
    expect(createImprovementData(gear)).toEqual<ReturnType<typeof createImprovementData>>({
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
    const toFormula = (gear: GearBase) => createImprovementData(gear).contactSelectionBonus

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
    const toFormula = (gear: GearBase) => createImprovementData(gear).fighterPowerBonus

    it("戦闘機 -> 0.2 * 改修値", () => {
      const gear = GearBaseStub.fromAttrs("Fighter")
      expect(toFormula(gear)).toEqual({ multiplier: 0.2, type: "Linear" })
    })

    it("爆戦 -> 0.25 * 改修値", () => {
      const gear = GearBaseStub.fromAttrs("CbFighterBomber")
      expect(toFormula(gear)).toEqual({ multiplier: 0.25, type: "Linear" })
    })

    it("陸攻 -> 0.5 * sqrt(改修値)", () => {
      const gear = GearBaseStub.fromCategory("LbAttacker")
      expect(toFormula(gear)).toEqual({ multiplier: 0.5, type: "Sqrt" })
    })
  })

  describe("adjustedAntiAirBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementData(gear).adjustedAntiAirBonus

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
      const expected: ImprovementBonusFormula = { multiplier: 3, type: "Sqrt" }

      const aafd = GearBaseStub.fromCategory("AntiAirFireDirector")
      aafd.antiAir = 8
      expect(toFormula(aafd)).toEqual(expected)

      const ham = GearBaseStub.fromAttrs("HighAngleMount")
      ham.antiAir = 8
      expect(toFormula(ham)).toEqual(expected)
    })

    it("対空7以下の高射装置,高角砲 -> 2 * sqrt(改修値)", () => {
      const expected: ImprovementBonusFormula = { multiplier: 2, type: "Sqrt" }

      const aafd = GearBaseStub.fromCategory("AntiAirFireDirector")
      aafd.antiAir = 7
      expect(toFormula(aafd)).toEqual(expected)

      const ham = GearBaseStub.fromAttrs("HighAngleMount")
      ham.antiAir = 7
      expect(toFormula(ham)).toEqual(expected)
    })
  })

  describe("fleetAntiAirBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementData(gear).fleetAntiAirBonus

    it("対空8以上の高射装置,高角砲 -> 3 * sqrt(改修値)", () => {
      const expected: ImprovementBonusFormula = { multiplier: 3, type: "Sqrt" }

      const aafd = GearBaseStub.fromCategory("AntiAirFireDirector")
      aafd.antiAir = 8
      expect(toFormula(aafd)).toEqual(expected)

      const ham = GearBaseStub.fromAttrs("HighAngleMount")
      ham.antiAir = 8
      expect(toFormula(ham)).toEqual(expected)
    })

    it("対空7以下の高射装置,高角砲 -> 2 * sqrt(改修値)", () => {
      const expected: ImprovementBonusFormula = { multiplier: 2, type: "Sqrt" }

      const aafd = GearBaseStub.fromCategory("AntiAirFireDirector")
      aafd.antiAir = 7
      expect(toFormula(aafd)).toEqual(expected)

      const ham = GearBaseStub.fromAttrs("HighAngleMount")
      ham.antiAir = 7
      expect(toFormula(ham)).toEqual(expected)
    })

    it("対空電探 -> 1.5 * sqrt(改修値)", () => {
      const gear = GearBaseStub.fromAttrs("AirRadar")
      expect(toFormula(gear)).toEqual({ multiplier: 1.5, type: "Sqrt" })
    })
  })

  describe("shellingPowerBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementData(gear).shellingPowerBonus

    it("火力13以上 -> 1.5 * sqrt(改修値)", () => {
      const fire12 = GearBaseStub.from({ firepower: 12 })
      const fire13 = GearBaseStub.from({ firepower: 13 })

      expect(toFormula(fire12)).toBe(undefined)
      expect(toFormula(fire13)).toEqual({ multiplier: 1.5, type: "Sqrt" })
    })

    it("艦攻 -> 0.2 * 改修値", () => {
      const gear = GearBaseStub.fromCategory("CbTorpedoBomber")
      expect(toFormula(gear)).toEqual({ multiplier: 0.2, type: "Linear" })
    })

    it.each<GearName>(["12.7cm連装高角砲", "8cm高角砲", "8cm高角砲改+増設機銃", "10cm連装高角砲改+増設機銃"])(
      "%s -> 0.2 * 改修値",
      (name) => {
        const gear = makeGear(name)
        expect(toFormula(gear)).toEqual({ multiplier: 0.2, type: "Linear" })
      }
    )

    it.each<GearName>(["15.5cm三連装副砲", "15.5cm三連装副砲改", "15.2cm三連装砲"])("%s -> 0.3 * 改修値", (name) => {
      const gear = makeGear(name)
      expect(toFormula(gear)).toEqual({ multiplier: 0.3, type: "Linear" })
    })

    it.each<keyof typeof GearCategoryName>([
      "小口径主砲",
      "中口径主砲",
      "大口径主砲",
      "副砲",
      "対艦強化弾",
      "対空強化弾",
      "対空機銃",
      "探照灯",
      "大型探照灯",
      "高射装置",
      "上陸用舟艇",
      "特型内火艇",
      "対地装備",
    ])("%s -> 1 * sqrt(改修値)", (name) => {
      const gear = GearBaseStub.fromCategoryName(name)
      expect(toFormula(gear)).toEqual({ multiplier: 1, type: "Sqrt" })
    })

    it("ソナー, 大型ソナー, 爆雷投射機, 迫撃砲 -> 0.75 * sqrt(改修値)", () => {
      const sonor = GearBaseStub.fromCategory("Sonar")
      const largeSonar = GearBaseStub.fromCategory("LargeSonar")
      const depthChargeProjector = GearBaseStub.fromAttrs("DepthChargeProjector")
      const mortar = GearBaseStub.fromAttrs("Mortar")

      ;[sonor, largeSonar, depthChargeProjector, mortar].forEach((gear) => {
        expect(toFormula(gear)).toEqual({ multiplier: 0.75, type: "Sqrt" })
      })
    })
  })

  describe("shellingAccuracyBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementData(gear).shellingAccuracyBonus

    it("水上電探 -> 1.7 * sqrt(改修値)", () => {
      const gear = GearBaseStub.fromAttrs("SurfaceRadar")
      expect(toFormula(gear)).toEqual({ multiplier: 1.7, type: "Sqrt" })
    })

    it("主砲, 電探, 徹甲弾, 対空弾, 高射装置, 大発 -> 1 * sqrt(改修値)", () => {
      const main = GearBaseStub.fromAttrs("MainGun")
      const second = GearBaseStub.fromCategory("SecondaryGun")
      const radar = GearBaseStub.fromAttrs("Radar")
      const aps = GearBaseStub.fromCategory("ApShell")
      const aas = GearBaseStub.fromCategory("AntiAirShell")
      const aafd = GearBaseStub.fromCategory("AntiAirFireDirector")
      const lc = GearBaseStub.fromCategory("LandingCraft")

      ;[main, second, radar, aps, aas, aafd, lc].forEach((gear) => {
        expect(toFormula(gear)).toEqual({ multiplier: 1, type: "Sqrt" })
      })
    })
  })

  describe("aswPowerBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementData(gear).aswPowerBonus

    it("艦攻 -> 0.2 * 改修値", () => {
      const gear = GearBaseStub.fromCategory("CbTorpedoBomber")
      expect(toFormula(gear)).toEqual({ multiplier: 0.2, type: "Linear" })
    })

    it("爆雷, ソナー -> 1 * sqrt(改修値)", () => {
      const expected: ImprovementBonusFormula = { multiplier: 1, type: "Sqrt" }

      const depthCharge = GearBaseStub.fromCategory("DepthCharge")
      expect(toFormula(depthCharge)).toEqual(expected)

      const sonor = GearBaseStub.fromCategory("Sonar")
      expect(toFormula(sonor)).toEqual(expected)
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
    const toFormula = (gear: GearBase) => createImprovementData(gear).aswAccuracyBonus

    it("ソナー, 大型ソナー -> 1.3 * sqrt(改修値)", () => {
      const expected: ImprovementBonusFormula = { multiplier: 1.3, type: "Sqrt" }

      const sonar = GearBaseStub.fromCategory("Sonar")
      expect(toFormula(sonar)).toEqual(expected)
      const largeSonar = GearBaseStub.fromCategory("LargeSonar")
      expect(toFormula(largeSonar)).toEqual(expected)
    })
  })

  describe("torpedoPowerBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementData(gear).torpedoPowerBonus

    it("魚雷, 機銃 -> 1.2 * sqrt(改修値)", () => {
      const expected: ImprovementBonusFormula = { multiplier: 1.2, type: "Sqrt" }

      const torpedo = GearBaseStub.fromCategory("Torpedo")
      expect(toFormula(torpedo)).toEqual(expected)

      const aaGun = GearBaseStub.fromCategory("AntiAirGun")
      expect(toFormula(aaGun)).toEqual(expected)
    })
  })

  describe("torpedoAccuracyBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementData(gear).torpedoAccuracyBonus

    it("魚雷, 機銃 -> 2 * sqrt(改修値)", () => {
      const expected: ImprovementBonusFormula = { multiplier: 2, type: "Sqrt" }

      const torpedo = GearBaseStub.fromCategory("Torpedo")
      expect(toFormula(torpedo)).toEqual(expected)
      const aaGun = GearBaseStub.fromCategory("AntiAirGun")
      expect(toFormula(aaGun)).toEqual(expected)
    })
  })

  describe("torpedoEvasionBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementData(gear).torpedoEvasionBonus

    it("ソナー, 大型ソナー -> 1.5 * sqrt(改修値)", () => {
      const expected: ImprovementBonusFormula = { multiplier: 1.5, type: "Sqrt" }

      const sonar = GearBaseStub.fromCategory("Sonar")
      expect(toFormula(sonar)).toEqual(expected)
      const largeSonar = GearBaseStub.fromCategory("LargeSonar")
      expect(toFormula(largeSonar)).toEqual(expected)
    })
  })

  describe("nightPowerBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementData(gear).nightPowerBonus

    it.each<GearName>(["12.7cm連装高角砲", "8cm高角砲", "8cm高角砲改+増設機銃", "10cm連装高角砲改+増設機銃"])(
      "%s -> 0.2 * 改修値",
      (name) => {
        const gear = makeGear(name)
        expect(toFormula(gear)).toEqual({ multiplier: 0.2, type: "Linear" })
      }
    )

    it.each<GearName>(["15.5cm三連装副砲", "15.5cm三連装副砲改", "15.2cm三連装砲"])("%s -> 0.3 * 改修値", (name) => {
      const gear = makeGear(name)
      expect(toFormula(gear)).toEqual({ multiplier: 0.3, type: "Linear" })
    })

    it.each<keyof typeof GearCategoryName>([
      "小口径主砲",
      "中口径主砲",
      "大口径主砲",
      "副砲",
      "対艦強化弾",
      "対空強化弾",
      "探照灯",
      "大型探照灯",
      "高射装置",
      "上陸用舟艇",
      "特型内火艇",
      "対地装備",
      "魚雷",
      "特殊潜航艇",
    ])("%s -> 1 * sqrt(改修値)", (name) => {
      const gear = GearBaseStub.from({ category: GearCategoryName[name] })
      expect(toFormula(gear)).toEqual({ multiplier: 1, type: "Sqrt" })
    })
  })

  describe("nightAccuracyBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementData(gear).nightAccuracyBonus

    it("水上電探 -> 1.6 * sqrt(改修値)", () => {
      const gear = GearBaseStub.fromAttrs("SurfaceRadar")
      expect(toFormula(gear)).toEqual({ multiplier: 1.6, type: "Sqrt" })
    })

    it("電探, 中口径主砲 -> 1.3 * sqrt(改修値)", () => {
      const expected: ImprovementBonusFormula = { multiplier: 1.3, type: "Sqrt" }

      const radar = GearBaseStub.fromAttrs("Radar")
      expect(toFormula(radar)).toEqual(expected)

      const mediumGun = GearBaseStub.fromCategory("MediumCaliberMainGun")
      expect(toFormula(mediumGun)).toEqual(expected)
    })
  })

  describe("defensePowerBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementData(gear).defensePowerBonus

    it("中型バルジ -> 0.2 * 改修値", () => {
      const gear = GearBaseStub.fromCategory("MediumExtraArmor")
      expect(toFormula(gear)).toEqual({ multiplier: 0.2, type: "Linear" })
    })

    it("大型バルジ -> 0.3 * 改修値", () => {
      const gear = GearBaseStub.fromCategory("LargeExtraArmor")
      expect(toFormula(gear)).toEqual({ multiplier: 0.3, type: "Linear" })
    })
  })

  describe("effectiveLosBonus", () => {
    const toFormula = (gear: GearBase) => createImprovementData(gear).effectiveLosBonus

    it("小型電探 -> 1.25 * sqrt(改修値)", () => {
      const gear = GearBaseStub.fromCategory("SmallRadar")
      expect(toFormula(gear)).toEqual({ multiplier: 1.25, type: "Sqrt" })
    })

    it("大型電探 -> 1.4 * sqrt(改修値)", () => {
      const gear = GearBaseStub.fromCategory("LargeRadar")
      expect(toFormula(gear)).toEqual({ multiplier: 1.4, type: "Sqrt" })
    })

    it("艦偵, 水偵 -> 1.2 * sqrt(改修値)", () => {
      const expected: ImprovementBonusFormula = { multiplier: 1.2, type: "Sqrt" }

      const cbRecon = GearBaseStub.fromCategory("CbRecon")
      expect(toFormula(cbRecon)).toEqual(expected)

      const reconSeaplane = GearBaseStub.fromCategory("ReconSeaplane")
      expect(toFormula(reconSeaplane)).toEqual(expected)
    })

    it("水爆 -> 1.15 * sqrt(改修値)", () => {
      const gear = GearBaseStub.fromCategory("SeaplaneBomber")
      expect(toFormula(gear)).toEqual({ multiplier: 1.15, type: "Sqrt" })
    })
  })
})
