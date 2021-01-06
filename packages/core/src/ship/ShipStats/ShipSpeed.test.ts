import { ShipSpeed } from "./ShipSpeed"

describe("ShipSpeed", () => {
  it("value = naked + bonus", () => {
    expect(new ShipSpeed(5, 10)).toMatchObject<ShipSpeed>({ naked: 5, bonus: 10, value: 15 })
  })
})
