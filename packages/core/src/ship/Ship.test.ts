import { ShipImpl } from "./Ship"
import { ShipCommonBase } from "./MasterShip"
import ShipStatsStub from "../utils/ShipStatsStub"
import EquipmentMock from "../utils/EquipmentMock"
import ShipHealthMock from "../utils/ShipHealthMock"

describe("ShipImpl", () => {
  it.skip("constructor", () => {
    const base: ShipCommonBase = {
      shipId: 0,
      shipClass: 0,
      shipType: 0,
      name: "",
      ruby: "",
      sortId: 0,
      is: jest.fn(),
      canEquip: jest.fn(),
    }

    const stats = new ShipStatsStub()
    const equipment = new EquipmentMock()
    const health = new ShipHealthMock()

    expect(new ShipImpl(base, stats, equipment, health)).toBeTruthy()
  })

  it.skip("canEquip")

  it.skip("fleetLosFactor")
})
