import { ShipSpeed } from "./ShipSpeed"

describe("ShipSpeed", () => {
  it("displayed = naked + bonus", () => {
    expect(new ShipSpeed(5, 10)).toMatchObject<ShipSpeed>({ naked: 5, bonus: 10, displayed: 15 })
  })
})
