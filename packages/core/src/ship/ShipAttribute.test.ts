import { createShipAttrs, ShipAttribute } from "./ShipAttribute"
import { ShipIdentityWithSpeed } from "./types"

const getStub = (src: Partial<ShipIdentityWithSpeed>): ShipIdentityWithSpeed => ({
  shipId: 0,
  shipType: 0,
  shipClass: 0,
  sortId: 0,
  name: "",
  ruby: "",
  speed: 0,
  ...src,
})

describe("createShipAttrs", () => {
  it("shipId > 1500 なら Abyssal", () => {
    expect(createShipAttrs(getStub({ shipId: 1500 }))).not.toContain<ShipAttribute>("Abyssal")
    expect(createShipAttrs(getStub({ shipId: 1501 }))).toContain<ShipAttribute>("Abyssal")
  })
})
