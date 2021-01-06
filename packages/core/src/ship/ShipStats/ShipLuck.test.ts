import { ShipLuck } from "./ShipLuck"

describe("ShipLuck", () => {
  it("diffのデフォルトは0", () => {
    expect(new ShipLuck([10, 20]).diff).toBe(0)
  })
  it("value = left + diff", () => {
    expect(new ShipLuck([8, 50], 12).value).toBe(8 + 12)
  })
})
