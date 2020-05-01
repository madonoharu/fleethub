import { ShipLuck } from "./ShipLuck"

describe("ShipLuck", () => {
  it("increaseのデフォルトは0", () => {
    expect(new ShipLuck([10, 20]).increase).toBe(0)
  })
  it("displayed = left + increase", () => {
    expect(new ShipLuck([8, 50], 12).displayed).toBe(8 + 12)
  })
})
