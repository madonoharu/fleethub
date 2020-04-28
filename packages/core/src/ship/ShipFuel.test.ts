import { ShipFuel } from "./ShipFuel"

describe("ShipFuel", () => {
  it("constructor", () => {
    expect(new ShipFuel()).toMatchObject<ShipFuel>({ max: 0, current: 0, penalty: 0 })
    expect(new ShipFuel(100)).toMatchObject<ShipFuel>({ max: 100, current: 100, penalty: 0 })
    expect(new ShipFuel(50, 40)).toMatchObject<ShipFuel>({ max: 50, current: 40, penalty: 0 })
  })

  it.each<[number, number, number]>([
    [1000, 1000, 0],
    [1000, 750, 0],
    [1000, 749, 1],
    [1000, 740, 1],
    [1000, 739, 2],
    [1000, 0, 75],
  ])("最大%s, 現在%s -> 燃ペナ%s", (max, current, expected) => {
    expect(new ShipFuel(max, current).penalty).toBe(expected)
  })
})
