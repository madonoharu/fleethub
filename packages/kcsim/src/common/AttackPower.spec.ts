import {
  composeAttackPowerModifierRecord,
  createFm,
  createPrecapFm,
  createPostcapFm,
  createAttackPower,
  FunctionalModifier
} from "./AttackPower"
import { softcap } from "../utils"

describe("AttackPower", () => {
  it("composeAttackPowerModifierRecord", () => {
    expect(composeAttackPowerModifierRecord({ a5: 1.1 }, { a5: 1.2 }, { a5: 1.3 })).toEqual({ a5: 1.1 * 1.2 * 1.3 })
    expect(composeAttackPowerModifierRecord({ a5: 2, b5: 11 }, { b5: 12 })).toEqual({ a5: 2, b5: 23 })

    expect(composeAttackPowerModifierRecord({ a5: 1.2 }, { a5: 0 })).toEqual({ a5: 0 })
    expect(composeAttackPowerModifierRecord({ b14: 10 }, { b14: 0 })).toEqual({ b14: 10 })
  })

  it("createFm", () => {
    expect(createFm(20)(1)).toBe(1 * 20)
    expect(createFm(10, 3.2)(4)).toBe(4 * 10 + 3.2)
    expect(createFm(1.5, 3.2, true)(5)).toBe(Math.floor(5 * 1.5 + 3.2))
  })

  it("createPrecapFm", () => {
    expect(createPrecapFm({ a12: 1.2, b12: 20 })(11)).toBe(11 * 1.2 + 20)
    expect(createPrecapFm({ a13: 1.5, b14: 25 })(12)).toBe(12 * 1.5 + 25)
    expect(
      createPrecapFm({
        a12: 1.21,
        b12: 1.22,
        a13: 1.31,
        b13: 1.32,
        a13next: 1.33,
        b13next: 1.34,
        a14: 1.41,
        b14: 1.42
      })(13)
    ).toBe((((13 * 1.21 + 1.22) * 1.31 + 1.32) * 1.33 + 1.34) * 1.41 + 1.42)

    const fm14prev: FunctionalModifier = value => value * 1.6
    expect(
      createPrecapFm(
        {
          a13next: 1.33,
          b13next: 1.34,
          a14: 1.41,
          b14: 1.42
        },
        fm14prev
      )(13)
    ).toBe((13 * 1.33 + 1.34) * 1.6 * 1.41 + 1.42)
  })

  it("createPostcapFm", () => {
    expect(createPostcapFm({ a5: 1.1 })(11)).toBe(Math.floor(11 * 1.1))
    expect(createPostcapFm({ b5: 1.2 })(12)).toBe(Math.floor(12 + 1.2))
    expect(createPostcapFm({ a6: 1.3 })(13)).toBe(Math.floor(13 * 1.3))
    expect(createPostcapFm({ b6: 1.4 })(14)).toBe(Math.floor(14 + 1.4))
    expect(createPostcapFm({ a11: 1.5 })(15)).toBe(15 * 1.5)
    expect(createPostcapFm({ b11: 1.6 })(16)).toBe(16 + 1.6)
    expect(
      createPostcapFm({
        a5: 1.1,
        b5: 1.2,
        a6: 1.3,
        b6: 1.4,
        a11: 1.5,
        b11: 1.6
      })(17)
    ).toBe(Math.floor(Math.floor(17 * 1.1 + 1.2) * 1.3 + 1.4) * 1.5 + 1.6)
  })

  it("createAttackPower", () => {
    const basic = 100
    const cap = 150
    const precap = basic * 1.5
    const capped = softcap(cap, precap)
    const isCapped = capped > cap
    const postcap = capped * 1.4
    const factors = { basic, cap, modifiers: { a14: 1.5, a11: 1.4 } }
    expect(createAttackPower(factors)).toEqual({ precap, capped, isCapped, postcap })

    const fm11next = (value: number) => Math.floor(value * 1.5)
    expect(createAttackPower({ ...factors, fm11next })).toEqual({
      precap,
      capped,
      isCapped,
      postcap: fm11next(postcap)
    })
  })
})
