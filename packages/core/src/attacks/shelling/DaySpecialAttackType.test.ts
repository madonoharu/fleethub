import { DaySpecialAttackType, DaySpecialAttackParams, getPossibleDaySpecialAttackTypes } from "./DaySpecialAttackType"

const defaultParams: DaySpecialAttackParams = {
  isCarrierShelling: false,
  isIseClassK2: false,
  hasObservationSeaplane: false,

  mainGunCount: 0,
  secondaryGunCount: 0,
  hasAPShell: false,
  hasRader: false,

  zuiunCount: 0,
  suisei634Count: 0,
  bomberCount: 0,
  hasTorpedoBomber: false,
  hasFighter: false,
}

const getTypes = (partial: Partial<DaySpecialAttackParams>) =>
  getPossibleDaySpecialAttackTypes({ ...defaultParams, ...partial })

describe("getPossibleDaySpecialAttackTypes", () => {
  describe("弾着観測射撃", () => {
    it("弾着観測射撃は観測機と主砲が必須", () => {
      const params: Partial<DaySpecialAttackParams> = {
        hasObservationSeaplane: false,
        mainGunCount: 0,
        secondaryGunCount: 1,
        hasAPShell: true,
        hasRader: true,
      }
      expect(getTypes(params)).toHaveLength(0)
      expect(getTypes({ ...params, mainGunCount: 1 })).toHaveLength(0)
      expect(getTypes({ ...params, hasObservationSeaplane: true })).toHaveLength(0)

      params.mainGunCount = 1
      params.hasObservationSeaplane = true
      expect(getTypes(params)).not.toHaveLength(0)
    })

    it("弾着観測射撃は重複する", () => {
      expect(
        getTypes({
          hasObservationSeaplane: true,
          mainGunCount: 2,
          secondaryGunCount: 1,
          hasAPShell: true,
          hasRader: true,
        })
      ).toHaveLength(5)
    })

    it.each`
      type              | mainGunCount | secondaryGunCount | hasAPShell | hasRader | expected
      ${"MainMain"}     | ${2}         | ${0}              | ${true}    | ${false} | ${"可"}
      ${"MainMain"}     | ${1}         | ${0}              | ${true}    | ${false} | ${"不可"}
      ${"MainMain"}     | ${2}         | ${0}              | ${false}   | ${false} | ${"不可"}
      ${"MainAPShell"}  | ${1}         | ${1}              | ${true}    | ${false} | ${"可"}
      ${"MainAPShell"}  | ${1}         | ${0}              | ${true}    | ${false} | ${"不可"}
      ${"MainAPShell"}  | ${1}         | ${1}              | ${false}   | ${false} | ${"不可"}
      ${"MainRader"}    | ${1}         | ${1}              | ${false}   | ${true}  | ${"可"}
      ${"MainRader"}    | ${1}         | ${0}              | ${false}   | ${true}  | ${"不可"}
      ${"MainRader"}    | ${1}         | ${1}              | ${false}   | ${false} | ${"不可"}
      ${"MainSecond"}   | ${1}         | ${1}              | ${false}   | ${false} | ${"可"}
      ${"MainSecond"}   | ${1}         | ${0}              | ${false}   | ${false} | ${"不可"}
      ${"DoubleAttack"} | ${2}         | ${0}              | ${false}   | ${false} | ${"可"}
      ${"DoubleAttack"} | ${1}         | ${1}              | ${false}   | ${false} | ${"不可"}
    `(
      "$type: 主$mainGunCount, 副$secondaryGunCount, 徹甲弾$hasAPShell, 電探$hasRader -> 発動$expected",
      ({ mainGunCount, secondaryGunCount, hasAPShell, hasRader, type, expected }) => {
        const types = getTypes({ hasObservationSeaplane: true, mainGunCount, secondaryGunCount, hasAPShell, hasRader })
        expect(types.includes(type)).toBe(expected === "可")
      }
    )
  })

  describe("戦爆連合", () => {
    it("戦爆連合は空母砲撃でのみ発動する", () => {
      const params: Partial<DaySpecialAttackParams> = {
        isCarrierShelling: false,
        hasFighter: true,
        bomberCount: 2,
        hasTorpedoBomber: true,
      }
      expect(getTypes(params)).toHaveLength(0)

      params.isCarrierShelling = true
      expect(getTypes(params)).toHaveLength(3)
    })
    it("重複可能", () => {
      expect(
        getTypes({
          isCarrierShelling: true,
          hasFighter: true,
          bomberCount: 2,
          hasTorpedoBomber: true,
        })
      ).toHaveLength(3)
    })

    it.each`
      type     | hasFighter | bomberCount | hasTorpedoBomber | expected
      ${"FBA"} | ${true}    | ${1}        | ${true}          | ${"可"}
      ${"FBA"} | ${false}   | ${1}        | ${true}          | ${"不可"}
      ${"FBA"} | ${true}    | ${0}        | ${true}          | ${"不可"}
      ${"FBA"} | ${true}    | ${1}        | ${false}         | ${"不可"}
      ${"BBA"} | ${false}   | ${2}        | ${true}          | ${"可"}
      ${"BBA"} | ${false}   | ${1}        | ${true}          | ${"不可"}
      ${"BBA"} | ${false}   | ${2}        | ${false}         | ${"不可"}
      ${"BA"}  | ${false}   | ${1}        | ${true}          | ${"可"}
      ${"BA"}  | ${false}   | ${0}        | ${true}          | ${"不可"}
      ${"BA"}  | ${false}   | ${1}        | ${false}         | ${"不可"}
    `(
      "$type: 艦戦$hasFighter, 艦爆$bomberCount, 艦攻$hasTorpedoBomber -> 発動$expected",
      ({ hasFighter, bomberCount, hasTorpedoBomber, type, expected }) => {
        const types = getTypes({ isCarrierShelling: true, hasFighter, bomberCount, hasTorpedoBomber })
        expect(types.includes(type)).toBe(expected === "可")
      }
    )
  })

  describe("立体攻撃", () => {
    it("立体攻撃は伊勢型改二かつ主砲が必要", () => {
      const params: Partial<DaySpecialAttackParams> = {
        isIseClassK2: false,
        mainGunCount: 0,
        zuiunCount: 2,
        suisei634Count: 2,
      }
      expect(getTypes(params)).toHaveLength(0)
      expect(getTypes({ ...params, isIseClassK2: true })).toHaveLength(0)
      expect(getTypes({ ...params, mainGunCount: 1 })).toHaveLength(0)

      expect(getTypes({ ...params, isIseClassK2: true, mainGunCount: 1 })).not.toHaveLength(0)
    })

    it("立体攻撃は弾着観測射撃とも重複する", () => {
      const types = getTypes({
        hasObservationSeaplane: true,
        hasAPShell: true,

        isIseClassK2: true,
        mainGunCount: 2,
        zuiunCount: 2,
        suisei634Count: 2,
      })
      expect(types).toEqual(
        expect.arrayContaining<DaySpecialAttackType>(["Zuiun", "Suisei", "MainMain", "DoubleAttack"])
      )
    })
  })
})
