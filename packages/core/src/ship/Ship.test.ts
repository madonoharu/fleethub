import { ShipImpl } from "./Ship"
import { ShipCommonBase } from "./types"

import { ShipStatsStub, EquipmentMock, GearStub } from "../utils"

const getMocks = () => {
  const base: ShipCommonBase = {
    shipId: 1,
    shipClass: 2,
    shipType: 3,
    sortId: 4,
    name: "5",
    ruby: "6",
    is: jest.fn(),
    canEquip: jest.fn(),
  }

  const stats = new ShipStatsStub()
  const equipment = new EquipmentMock()
  const getNextBonusesMockFn = jest.fn()

  return [base, stats, equipment, getNextBonusesMockFn] as const
}

describe("ShipImpl", () => {
  it("constructor", () => {
    const [base, stats, equipment, getNextBonusesMockFn] = getMocks()
    const ship = new ShipImpl(base, stats, equipment, getNextBonusesMockFn)

    expect(base).toMatchObject(base)
    expect(ship.equipment).toBe(equipment)
    expect(ship.getNextBonuses).toBe(getNextBonusesMockFn)

    const statKeys = Object.keys(stats) as Array<keyof typeof stats>
    statKeys.forEach((key) => {
      expect(ship[key]).toBe(stats[key])
    })
  })

  it("fleetLosFactor = naked-los + sum(ObservationSeaplane-los * [sqrt(slotSize)])", () => {
    const [base, stats, equipment, getNextBonusesMockFn] = getMocks()
    const ship = new ShipImpl(base, stats, equipment, getNextBonusesMockFn)
    stats.los.naked = 37

    equipment.sumBy.mockImplementationOnce((cb) => cb(new GearStub(), null, 0))
    expect(ship.fleetLosFactor).toBe(37 + 0)

    const observation = GearStub.fromAttrs("ObservationSeaplane")
    observation.los = 8
    equipment.sumBy.mockImplementationOnce((cb) => cb(observation, null, 0))
    expect(ship.fleetLosFactor).toBe(37 + 0)

    equipment.sumBy.mockImplementationOnce((cb) => cb(observation, null, 5))
    expect(ship.fleetLosFactor).toBe(37 + 8 * Math.floor(Math.sqrt(5)))
  })
})
