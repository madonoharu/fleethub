import ShipShellingCalculator from "./ShipShellingCalculator"
import ShipMock from "../../utils/ShipMock"

describe("ShipShellingCalculator", () => {
  describe("createAttackPower", () => {
    it("", () => {
      const ship = new ShipMock()
      ship.firepower.displayed = 100
      ship.equipment.sumBy.mockImplementationOnce((cb) => cb({ improvement: { shellingPowerBonus: 40 } }))

      const { createPower } = new ShipShellingCalculator(ship)

      expect(createPower({ fleetFactor: 5 })).toEqual<ReturnType<typeof createPower>>({
        firepower: 100,
        improvementBonus: 40,
        fleetFactor: 5,

        basic: 5 + 100 + 40 + 5,

        airPower: undefined,
      })
    })
  })
})
