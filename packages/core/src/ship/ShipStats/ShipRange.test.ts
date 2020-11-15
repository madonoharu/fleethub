import { ShipRange } from "./ShipRange"

describe("ShipRange", () => {
  it("素射程と装備射程のうち、長い方が表示に反映される", () => {
    expect(new ShipRange(1, 2, 0).value).toBe(2)
    expect(new ShipRange(3, 2, 0).value).toBe(3)
  })

  it("ボーナスは表示に単純加算される", () => {
    expect(new ShipRange(1, 2, 1).value).toBe(2 + 1)
    expect(new ShipRange(3, 2, 2).value).toBe(3 + 2)
  })
})
