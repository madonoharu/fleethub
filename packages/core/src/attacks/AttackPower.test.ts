import { softcap, calcAttackPower, AttackPowerParams } from "./AttackPower"

it("softcap(cap, precap) -> capped", () => {
  expect(softcap(150, 150)).toBe(150)
  expect(softcap(150, 160)).toBe(150 + Math.sqrt(10))
  expect(softcap(180, 180)).toBe(180)
  expect(softcap(180, 182)).toBe(180 + Math.sqrt(2))
})

const modifiers0: Omit<Required<AttackPowerParams>, "basic" | "cap" | "airPower"> = {
  a12: 1.01,
  b12: 1.02,
  a13: 1.03,
  b13: 1.04,
  a13next: 1.05,
  b13next: 1.06,
  a14: 1.07,
  b14: 1.08,
  a5: 1.09,
  b5: 1.1,
  a6: 1.11,
  b6: 1.12,
  a11: 1.13,
  b11: 1.14,
  apshellModifier: 1.15,
  proficiencyCriticalModifier: 1.16,
}

describe("calcAttackPower", () => {
  it("basicは同じ値", () => {
    const params: AttackPowerParams = { basic: 186.4, cap: 180, ...modifiers0 }
    expect(calcAttackPower(params).basic).toBe(params.basic)
  })

  it("a12, b12, a13, b13, a13next, b13next, a14, b14 はキャップ前補正", () => {
    const params: AttackPowerParams = { basic: 186.4, cap: 180, ...modifiers0 }

    const { a12, b12, a13, b13, a13next, b13next, a14, b14 } = modifiers0
    const expected = (((186.4 * a12 + b12) * a13 + b13) * a13next + b13next) * a14 + b14

    expect(calcAttackPower(params).precap).toBe(expected)
  })

  it("airPowerが有効な場合、a14前が [(post13next + airPower) * 1.5] + 25 になる", () => {
    const airPower = 50
    const params = { basic: 186.4, cap: 180, airPower, ...modifiers0 }

    const { a12, b12, a13, b13, a13next, b13next, a14, b14 } = modifiers0
    const post13next = ((186.4 * a12 + b12) * a13 + b13) * a13next + b13next
    const airBasic = Math.floor((post13next + airPower) * 1.5) + 25
    const expected = airBasic * a14 + b14

    expect(calcAttackPower(params).precap).toBe(expected)
  })

  it("キャップが有効なら isCapped -> true", () => {
    expect(calcAttackPower({ basic: 180, cap: 180 }).isCapped).toBe(false)
    expect(calcAttackPower({ basic: 181, cap: 180 }).isCapped).toBe(true)
    expect(calcAttackPower({ basic: 100, cap: 180, a14: 2 }).isCapped).toBe(true)
    expect(calcAttackPower({ basic: 100, cap: 180, a11: 2 }).isCapped).toBe(false)
  })

  it("capped はキャップ直後の値", () => {
    expect(calcAttackPower({ basic: 180, cap: 180 }).capped).toBe(180)
    expect(calcAttackPower({ basic: 180, cap: 180, b14: 10 }).capped).toBe(180 + Math.sqrt(10))
  })

  it("a5, b5, a6, b6, a11, b11 はキャップ後補正", () => {
    const params = { basic: 100, cap: 180, a5: 1.51, b5: 1.52, a6: 1.61, b6: 1.62, a11: 1.111, b11: 1.112 }
    const { a5, b5, a6, b6, a11, b11 } = params

    const power = calcAttackPower(params)
    const expected = Math.floor(Math.floor(power.capped * a5 + b5) * a6 + b6) * a11 + b11

    expect(power.normal).toBe(expected)
  })

  it("徹甲弾補正が有効な場合切り捨てが発生する", () => {
    const basic = 128
    const cap = 180
    const a11 = 1.1

    expect(calcAttackPower({ basic, cap, a11 }).normal).toBe(basic * a11)
    expect(calcAttackPower({ basic, cap, a11, apshellModifier: 1 }).normal).toBe(Math.floor(basic * a11))
    expect(calcAttackPower({ basic, cap, a11, apshellModifier: 1.2 }).normal).toBe(Math.floor(basic * a11 * 1.2))
  })

  it("critical = [normal * 1.5 * proficiencyCriticalModifier]", () => {
    const cases: AttackPowerParams[] = [
      { basic: 10, cap: 180 },
      { basic: 158, cap: 150 },
      { basic: 205, cap: 180, apshellModifier: 1.1 },
      { basic: 56, cap: 180, proficiencyCriticalModifier: 1.3 },
      { basic: 150, cap: 180, airPower: 80, proficiencyCriticalModifier: 1.3 },
    ]

    cases.forEach((params) => {
      const { proficiencyCriticalModifier = 1 } = params
      const power = calcAttackPower(params)

      expect(power.critical).toBe(Math.floor(power.normal * 1.5 * proficiencyCriticalModifier))
    })
  })
})
