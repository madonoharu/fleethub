import { ShipAccuracy } from "./ShipAccuracy"

describe("ShipAccuracy", () => {
  it("constructor", () => {
    expect(new ShipAccuracy(2, 3)).toMatchObject<ShipAccuracy>({ equipment: 2, bonus: 3, displayed: 5 })
  })
})
