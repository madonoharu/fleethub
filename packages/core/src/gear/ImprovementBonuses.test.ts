import { createImprovementBonuses, ImprovementBonuses } from "./ImprovementBonuses"

import { GearName } from "@fleethub/data"
import { range } from "lodash-es"

import { GearBaseStub } from "../utils/GearBaseStub"
import { makeGear } from "../utils/testUtils"
import { GearBase } from "./MasterGear"

type Case = [GearName, number, number]

const starsRange = range(11)

describe("createImprovementBonuses", () => {
  it("デフォルトの戻り値は0", () => {
    const gear = new GearBaseStub()
    expect(createImprovementBonuses(gear, 0)).toEqual<ReturnType<typeof createImprovementBonuses>>({
      contactSelection: 0,
      fighterPower: 0,
      adjustedAntiAir: 0,
    })
  })

  describe("ContactSelectionModifier", () => {
    it.each<[GearName, number]>([
      ["二式艦上偵察機", 0.25],
      ["試製景雲(艦偵型)", 0.4],
      ["零式水上観測機", 0.2],
      ["零式水上偵察機", 0.14],
      ["Ro.43水偵", 0.14],
      ["九八式水上偵察機(夜偵)", 0.1],
    ])("%s -> %s * ☆", (name, expected) => {
      const gear = makeGear(name)
      starsRange.forEach((stars) => {
        const modifier = createImprovementBonuses(gear, stars).contactSelection
        expect(modifier).toBe(stars * expected)
      })
    })
  })

  describe("FighterPowerModifier ", () => {
    it("戦闘機なら 0.2 * ☆", () => {
      const gear = GearBaseStub.fromAttrs("Fighter")
      const multiplier = 0.2

      starsRange.forEach((stars) => {
        const modifier = createImprovementBonuses(gear, stars).fighterPower
        expect(modifier).toBe(multiplier * stars)
      })
    })

    it("爆戦なら 0.25 * ☆", () => {
      const gear = GearBaseStub.fromAttrs("FighterBomber")
      const multiplier = 0.2

      starsRange.forEach((stars) => {
        const modifier = createImprovementBonuses(gear, stars).fighterPower
        expect(modifier).toBe(multiplier * stars)
      })
    })

    it("陸攻なら 0.5 * sqrt(☆)", () => {
      const gear = GearBaseStub.fromCategory("LandBasedAttackAircraft")

      starsRange.forEach((stars) => {
        const modifier = createImprovementBonuses(gear, stars).fighterPower
        const expected = 0.5 * Math.sqrt(stars)
        expect(modifier).toBe(expected)
      })
    })
  })
})
