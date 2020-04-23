import { createImprovement, Improvement } from "./Improvement"

import { GearName } from "@fleethub/data"
import { range } from "lodash-es"

import { GearBaseStub } from "../utils/GearBaseStub"
import { makeGear } from "../utils/testUtils"

type Case = [GearName, number, number]

const starsRange = range(11)

const expectMultiplierSqrtStars = (getBonus: (stars: number) => number, multiplier: number) => {
  const bonuses = starsRange.map(getBonus)
  const expected = starsRange.map((stars) => multiplier * Math.sqrt(stars))
  expect(bonuses).toEqual(expected)
}

const expectMultiplierStars = (getBonus: (stars: number) => number, multiplier: number) => {
  const bonuses = starsRange.map(getBonus)
  const expected = starsRange.map((stars) => multiplier * stars)
  expect(bonuses).toEqual(expected)
}

describe("createImprovement", () => {
  it("デフォルトの戻り値は0", () => {
    const gear = new GearBaseStub()
    expect(createImprovement(gear, 0)).toEqual<ReturnType<typeof createImprovement>>({
      contactSelectionBonus: 0,
      fighterPowerBonus: 0,
      adjustedAntiAirBonus: 0,
      fleetAntiAirBonus: 0,
      shellingPowerBonus: 0,
      shellingAccuracyBonus: 0,
      aswPowerBonus: 0,
    })
  })

  describe("contactSelectionBonus", () => {
    it.each<[GearName, number]>([
      ["二式艦上偵察機", 0.25],
      ["試製景雲(艦偵型)", 0.4],
      ["零式水上観測機", 0.2],
      ["零式水上偵察機", 0.14],
      ["Ro.43水偵", 0.14],
      ["九八式水上偵察機(夜偵)", 0.1],
    ])("%s -> %s * ☆", (name, expected) => {
      const gear = makeGear(name)
      expectMultiplierStars((stars) => createImprovement(gear, stars).contactSelectionBonus, expected)
    })
  })

  describe("fighterPowerBonus ", () => {
    it("戦闘機 -> 0.2 * ☆", () => {
      const gear = GearBaseStub.fromAttrs("Fighter")
      const expected = 0.2

      expectMultiplierStars((stars) => createImprovement(gear, stars).fighterPowerBonus, expected)
    })

    it("爆戦 -> 0.25 * ☆", () => {
      const gear = GearBaseStub.fromAttrs("FighterBomber")
      const expected = 0.25

      expectMultiplierStars((stars) => createImprovement(gear, stars).fighterPowerBonus, expected)
    })

    it("陸攻 -> 0.5 * sqrt(☆)", () => {
      const gear = GearBaseStub.fromCategory("LandBasedAttackAircraft")
      const expected = 0.5

      expectMultiplierSqrtStars((stars) => createImprovement(gear, stars).fighterPowerBonus, expected)
    })
  })

  describe("adjustedAntiAirBonus", () => {
    it("対空8以上の対空機銃 -> 6 * sqrt(☆)", () => {
      const gear = GearBaseStub.fromCategory("AntiAircraftGun")
      gear.antiAir = 8
      const expected = 6

      expectMultiplierSqrtStars((stars) => createImprovement(gear, stars).adjustedAntiAirBonus, expected)
    })

    it("対空7以下の対空機銃 -> 4 * sqrt(☆)", () => {
      const gear = GearBaseStub.fromCategory("AntiAircraftGun")
      gear.antiAir = 7
      const expected = 4

      expectMultiplierSqrtStars((stars) => createImprovement(gear, stars).adjustedAntiAirBonus, expected)
    })

    it("対空8以上の高射装置,高角砲 -> 3 * sqrt(☆)", () => {
      const aafd = GearBaseStub.fromCategory("AntiAircraftFireDirector")
      aafd.antiAir = 8
      const ham = GearBaseStub.fromAttrs("HighAngleMount")
      ham.antiAir = 8

      const expected = 3

      expectMultiplierSqrtStars((stars) => createImprovement(aafd, stars).adjustedAntiAirBonus, expected)
      expectMultiplierSqrtStars((stars) => createImprovement(ham, stars).adjustedAntiAirBonus, expected)
    })

    it("対空7以下の高射装置,高角砲 -> 2 * sqrt(☆)", () => {
      const aafd = GearBaseStub.fromCategory("AntiAircraftFireDirector")
      aafd.antiAir = 7
      const ham = GearBaseStub.fromAttrs("HighAngleMount")
      ham.antiAir = 7

      const expected = 2

      expectMultiplierSqrtStars((stars) => createImprovement(aafd, stars).adjustedAntiAirBonus, expected)
      expectMultiplierSqrtStars((stars) => createImprovement(ham, stars).adjustedAntiAirBonus, expected)
    })
  })

  describe("fleetAntiAirBonus", () => {
    it("対空8以上の高射装置,高角砲 -> 3 * sqrt(☆)", () => {
      const aafd = GearBaseStub.fromCategory("AntiAircraftFireDirector")
      aafd.antiAir = 8
      const ham = GearBaseStub.fromAttrs("HighAngleMount")
      ham.antiAir = 8

      const expected = 3

      expectMultiplierSqrtStars((stars) => createImprovement(aafd, stars).fleetAntiAirBonus, expected)
      expectMultiplierSqrtStars((stars) => createImprovement(ham, stars).fleetAntiAirBonus, expected)
    })

    it("対空7以下の高射装置,高角砲 -> 2 * sqrt(☆)", () => {
      const aafd = GearBaseStub.fromCategory("AntiAircraftFireDirector")
      aafd.antiAir = 7
      const ham = GearBaseStub.fromAttrs("HighAngleMount")
      ham.antiAir = 7

      const expected = 2

      expectMultiplierSqrtStars((stars) => createImprovement(aafd, stars).fleetAntiAirBonus, expected)
      expectMultiplierSqrtStars((stars) => createImprovement(ham, stars).fleetAntiAirBonus, expected)
    })

    it("対空1以上の電探 -> 1.5 * sqrt(☆)", () => {
      const gear = GearBaseStub.fromAttrs("Radar")
      gear.antiAir = 1

      const expected = 1.5

      expectMultiplierSqrtStars((stars) => createImprovement(gear, stars).fleetAntiAirBonus, expected)
    })
  })

  describe("shellingPowerBonus", () => {
    it("火力13以上 -> 1.5 * sqrt(☆)", () => {
      const fire12 = GearBaseStub.from({ firepower: 12 })
      const fire13 = GearBaseStub.from({ firepower: 13 })

      expectMultiplierSqrtStars((stars) => createImprovement(fire12, stars).shellingPowerBonus, 0)
      expectMultiplierSqrtStars((stars) => createImprovement(fire13, stars).shellingPowerBonus, 1.5)
    })

    it("艦上攻撃機 -> 0.2 * ☆", () => {
      const gear = GearBaseStub.fromCategory("CarrierBasedTorpedoBomber")

      expectMultiplierStars((stars) => createImprovement(gear, stars).shellingPowerBonus, 0.2)
    })
  })
})
