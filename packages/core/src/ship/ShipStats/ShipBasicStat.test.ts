import { ShipBasicStat, ShipBasicStatWithLevel } from "./ShipBasicStat"

describe("ShipBasicStat", () => {
  it("constructor", () => {
    expect(new ShipBasicStat([11, 12], 13)).toMatchObject({ equipment: 13, increase: 0, bonus: 0 })
    expect(new ShipBasicStat([11, 12], 13, 14, 15)).toMatchObject({ equipment: 13, increase: 14, bonus: 15 })
  })

  const left = 1
  const right = 2
  const equipment = 3
  const increase = 4
  const bonus = 5
  const stat = new ShipBasicStat([left, right], equipment, increase, bonus)

  const expectedNaked = right + increase

  it("naked = right + increase", () => {
    expect(stat.naked).toBe(expectedNaked)
  })

  it("displayed = naked + equipment + bonus", () => {
    expect(stat.displayed).toBe(expectedNaked + equipment + bonus)
  })
})

describe("ShipBasicStatWithLevel", () => {
  it("constructor", () => {
    expect(new ShipBasicStatWithLevel(99, [10, 30], 40)).toMatchObject({ increase: 0, bonus: 0 })
    expect(new ShipBasicStatWithLevel(1, [2, 3], 4, 5, 6)).toMatchObject({ equipment: 4, increase: 5, bonus: 6 })
  })

  const level = 175
  const at1 = 100
  const at99 = 131
  const equipment = 4
  const increase = 5
  const bonus = 6

  const stat = new ShipBasicStatWithLevel(level, [at1, at99], 4, 5, 6)

  const expectedNaked = Math.floor(((at99 - at1) * level) / 99 + at1) + increase

  it("naked = Math.floor(((at99 - at1) * level) / 99 + at1) + increase", () => {
    expect(stat.naked).toBe(expectedNaked)
  })

  it("displayed = naked + equipment + bonus", () => {
    expect(stat.displayed).toBe(expectedNaked + equipment + bonus)
  })
})
