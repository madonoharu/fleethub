import { ShipMaxHp } from "./ShipMaxHp"

describe("ShipMaxHp", () => {
  it("constructor", () => {
    expect(new ShipMaxHp([10, 15], undefined, false)).toMatchObject({ diff: 0, value: 10 })

    expect(new ShipMaxHp([10, 15], 2, false)).toMatchObject({ diff: 2, value: 12 })
  })

  it("表示耐久はrightが上限になる", () => {
    const right = 11
    expect(new ShipMaxHp([15, right], undefined, false).value).toBe(right)
    expect(new ShipMaxHp([10, right], 8, false).value).toBe(right)
    expect(new ShipMaxHp([10, right], 0, true).value).toBe(right)
  })

  it.each<[number, number]>([
    [29, 4],
    [30, 5],
    [39, 5],
    [40, 6],
    [49, 6],
    [50, 7],
    [69, 7],
    [70, 8],
    [89, 8],
    [90, 9],
  ])("素耐久%s -> ケッコン補正%s", (left, expected) => {
    expect(new ShipMaxHp([left, Infinity], undefined, true).value - left).toBe(expected)
  })
})
