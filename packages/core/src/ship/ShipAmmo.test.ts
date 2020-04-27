import { ShipAmmoImpl, ShipAmmo } from "./ShipAmmo"

describe("ShipAmmo", () => {
  it("constructor", () => {
    expect(new ShipAmmoImpl()).toMatchObject<ShipAmmo>({ max: 0, current: 0, penalty: 1 })
    expect(new ShipAmmoImpl(100)).toMatchObject<ShipAmmo>({ max: 100, current: 100, penalty: 1 })
    expect(new ShipAmmoImpl(50, 40)).toMatchObject<ShipAmmo>({ max: 50, current: 40, penalty: 1 })
  })

  it.each<[number, number, number]>([
    [1000, 1000, 1],
    [1000, 500, 1],
    [1000, 499, 0.98],
    [1000, 490, 0.98],
    [1000, 489, 0.96],
  ])("最大%s, 現在%s -> 弾ペナ%s", (max, current, expected) => {
    expect(new ShipAmmoImpl(max, current).penalty).toBe(expected)
  })
})
