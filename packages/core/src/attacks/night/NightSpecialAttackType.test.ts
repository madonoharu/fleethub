import {
  getPossibleNightSpecialAttackTypes,
  NightSpecialAttackType,
  NightSpecialAttackTypeParams,
} from "./NightSpecialAttackType"
import { ShipType } from "@fleethub/data"

const defaultParams: NightSpecialAttackTypeParams = {
  shipType: 0,
  lateModelBowTorpedoCount: 0,
  hasSubmarineRadar: false,
  mainGunCount: 0,
  secondaryGunCount: 0,
  torpedoCount: 0,
  hasSurfaceRadar: false,
  hasLookout: false,
  isNightCarrier: false,
  nightFighterCount: 0,
  nightAttackerCount: 0,
  hasFuzeBomber: false,
  semiNightPlaneCount: 0,
}

const getTypes = (partial: Partial<NightSpecialAttackTypeParams>) =>
  getPossibleNightSpecialAttackTypes({ ...defaultParams, ...partial })

describe("getPossibleNightSpecialAttackTypes", () => {
  type Expected = NightSpecialAttackType | "NormalAttack"

  describe("通常夜戦CI (重複不可)", () => {
    it.each<[number, number, number, Expected]>([
      [1, 0, 0, "NormalAttack"],
      [0, 1, 0, "NormalAttack"],
      [0, 0, 1, "NormalAttack"],

      [2, 0, 0, "DoubleAttack"],
      [1, 1, 0, "DoubleAttack"],
      [1, 0, 1, "MainTorp"],
      [0, 2, 0, "DoubleAttack"],
      [0, 1, 1, "NormalAttack"],
      [0, 0, 2, "TorpTorp"],

      [3, 0, 0, "MainMainMain"],
      [2, 1, 0, "MainMainSecond"],
      [1, 2, 0, "DoubleAttack"],
      [2, 0, 1, "MainTorp"],
      [1, 0, 2, "TorpTorp"],
      [1, 1, 1, "MainTorp"],
      [0, 3, 0, "DoubleAttack"],
      [0, 2, 1, "DoubleAttack"],
      [0, 1, 2, "TorpTorp"],
      [0, 0, 3, "TorpTorp"],

      [4, 0, 0, "MainMainMain"],
      [3, 1, 0, "MainMainMain"],
      [2, 2, 0, "MainMainSecond"],
      [1, 3, 0, "DoubleAttack"],
      [3, 0, 1, "MainMainMain"],
      [2, 0, 2, "TorpTorp"],
      [1, 0, 3, "TorpTorp"],
      [2, 1, 1, "MainMainSecond"],
      [1, 2, 1, "MainTorp"],
      [1, 1, 2, "TorpTorp"],
      [0, 4, 0, "DoubleAttack"],
      [0, 3, 1, "DoubleAttack"],
      [0, 2, 2, "TorpTorp"],
      [0, 1, 3, "TorpTorp"],
      [0, 0, 4, "TorpTorp"],
    ])("主%s, 副%s, 魚%s -> %s", (mainGunCount, secondaryGunCount, torpedoCount, expected) => {
      const types = getTypes({ mainGunCount, secondaryGunCount, torpedoCount })
      if (expected === "NormalAttack") {
        expect(types).toEqual([])
      } else {
        expect(types).toEqual([expected])
      }
    })
  })

  describe("潜水夜戦CI", () => {
    it.each<[number, boolean, Expected]>([
      [0, false, "NormalAttack"],
      [1, false, "NormalAttack"],
      [1, true, "SubmarineRadarTorp"],
      [2, false, "SubmarineTorpTorp"],
      [2, true, "SubmarineRadarTorp"],
    ])("後期艦首魚雷%s, 潜水電探%s -> %s", (lateModelBowTorpedoCount, hasSubmarineRadar, expected) => {
      const types = getTypes({ lateModelBowTorpedoCount, hasSubmarineRadar })
      if (expected === "NormalAttack") {
        expect(types).toEqual([])
      } else {
        expect(types).toEqual([expected])
      }
    })

    it("潜水CIと通常CIは重複不可", () => {
      expect(getTypes({ lateModelBowTorpedoCount: 2, torpedoCount: 2 })).toEqual(["SubmarineTorpTorp"])
    })
  })

  describe("駆逐専用夜戦CI", () => {
    it("DD & 主1魚1水上電探 -> MainTorpRadar", () => {
      expect(getTypes({ shipType: ShipType.DD, mainGunCount: 1, torpedoCount: 1, hasSurfaceRadar: true })).toContain<
        NightSpecialAttackType
      >("MainTorpRadar")

      expect(getTypes({ mainGunCount: 1, torpedoCount: 1, hasSurfaceRadar: true })).not.toContain<
        NightSpecialAttackType
      >("MainTorpRadar")
    })

    it("DD & 魚1見張水上電探 -> TorpLookoutRadar", () => {
      expect(getTypes({ shipType: ShipType.DD, torpedoCount: 1, hasSurfaceRadar: true, hasLookout: true })).toContain<
        NightSpecialAttackType
      >("TorpLookoutRadar")

      expect(getTypes({ torpedoCount: 1, hasSurfaceRadar: true, hasLookout: true })).not.toContain<
        NightSpecialAttackType
      >("TorpLookoutRadar")
    })

    it("主魚電と魚見電と主魚は重複する", () => {
      expect(
        getTypes({ shipType: ShipType.DD, mainGunCount: 1, torpedoCount: 1, hasSurfaceRadar: true, hasLookout: true })
      ).toEqual<NightSpecialAttackType[]>(["MainTorpRadar", "TorpLookoutRadar", "MainTorp"])
    })
  })

  describe("夜襲CI", () => {
    it("夜戦空母でないなら夜襲CI不可", () => {
      expect(
        getTypes({ nightFighterCount: 2, nightAttackerCount: 2, hasFuzeBomber: true, semiNightPlaneCount: 2 })
      ).toHaveLength(0)
    })

    it.each`
      type               | nightFighterCount | nightAttackerCount | semiNightPlaneCount | hasFuzeBomber | expected
      ${"AerialAttack1"} | ${2}              | ${1}               | ${0}                | ${false}      | ${"可"}
      ${"AerialAttack1"} | ${1}              | ${1}               | ${0}                | ${false}      | ${"不可"}
      ${"AerialAttack1"} | ${2}              | ${0}               | ${0}                | ${false}      | ${"不可"}
      ${"AerialAttack2"} | ${1}              | ${1}               | ${0}                | ${false}      | ${"可"}
      ${"AerialAttack2"} | ${0}              | ${1}               | ${0}                | ${false}      | ${"不可"}
      ${"AerialAttack2"} | ${1}              | ${0}               | ${0}                | ${false}      | ${"不可"}
      ${"SuiseiAttack"}  | ${1}              | ${0}               | ${0}                | ${true}       | ${"可"}
      ${"SuiseiAttack"}  | ${0}              | ${1}               | ${0}                | ${true}       | ${"可"}
      ${"SuiseiAttack"}  | ${1}              | ${0}               | ${0}                | ${true}       | ${"可"}
      ${"SuiseiAttack"}  | ${0}              | ${0}               | ${0}                | ${true}       | ${"不可"}
      ${"AerialAttack3"} | ${3}              | ${0}               | ${0}                | ${false}      | ${"可"}
      ${"AerialAttack3"} | ${2}              | ${0}               | ${1}                | ${false}      | ${"可"}
      ${"AerialAttack3"} | ${2}              | ${1}               | ${0}                | ${false}      | ${"不可"}
      ${"AerialAttack3"} | ${2}              | ${0}               | ${0}                | ${false}      | ${"不可"}
      ${"AerialAttack3"} | ${1}              | ${2}               | ${0}                | ${false}      | ${"可"}
      ${"AerialAttack3"} | ${1}              | ${1}               | ${1}                | ${false}      | ${"可"}
      ${"AerialAttack3"} | ${1}              | ${0}               | ${2}                | ${false}      | ${"可"}
      ${"AerialAttack3"} | ${1}              | ${0}               | ${1}                | ${false}      | ${"不可"}
      ${"AerialAttack3"} | ${1}              | ${1}               | ${0}                | ${false}      | ${"不可"}
      ${"AerialAttack3"} | ${0}              | ${2}               | ${2}                | ${false}      | ${"不可"}
    `(
      "$type: 夜戦$nightFighterCount, 夜攻$nightAttackerCount, 準夜間機$semiNightPlaneCount, 光電管彗星$hasFuzeBomber  -> 発動$expected",
      ({ nightFighterCount, nightAttackerCount, semiNightPlaneCount, hasFuzeBomber, type, expected }) => {
        const types = getTypes({
          isNightCarrier: true,
          nightFighterCount,
          nightAttackerCount,
          semiNightPlaneCount,
          hasFuzeBomber,
        })
        expect(types.includes(type)).toBe(expected === "可")
      }
    )
  })
})
