import { ShipClass, ShipId, GearId } from "@fleethub/data"

import { ShipImpl } from "./Ship"
import { ShipCommonBase } from "./types"

import { ShipStatsStub, EquipmentMock, GearStub } from "../utils"
import { ShipAttribute } from "./ShipAttribute"

const getNextBonusesMockFn = jest.fn()

class ShipCommonBaseStub implements ShipCommonBase {
  static fromAttrs = (...attrs: ShipAttribute[]) => Object.assign(new ShipCommonBaseStub(), { attrs })

  shipId = 0
  shipClass = 0
  shipType = 0
  sortId = 0
  name = ""
  ruby = ""
  attrs: ShipAttribute[] = []
  is = (attr: ShipAttribute) => this.attrs.includes(attr)
  canEquip = () => false
}

const getMocks = () => {
  const base = {
    shipId: 0,
    shipClass: 0,
    shipType: 0,
    sortId: 0,
    name: "",
    ruby: "",
    is: jest.fn(),
    canEquip: jest.fn(),
  }

  const stats = new ShipStatsStub()
  const equipment = new EquipmentMock()

  return [base, stats, equipment] as const
}

describe("ShipImpl", () => {
  it("constructor", () => {
    const [base, stats, equipment] = getMocks()
    const ship = new ShipImpl(base, stats, equipment, getNextBonusesMockFn)

    expect(base).toMatchObject(base)
    expect(ship.equipment).toBe(equipment)
    expect(ship.getNextBonuses).toBe(getNextBonusesMockFn)

    const statKeys = Object.keys(stats) as Array<keyof typeof stats>
    statKeys.forEach((key) => {
      expect(ship[key]).toBe(stats[key])
    })
  })

  it("fleetLosFactor = 素索敵 + sum(観測機索敵 * [sqrt(slotSize)])", () => {
    const [base, stats, equipment] = getMocks()
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

  it("軽巡軽量砲補正 = sqrt(singleGunCount) + 2 * sqrt(twinGunCount)", () => {
    const [base, stats, equipment] = getMocks()
    const ship = new ShipImpl(base, stats, equipment, getNextBonusesMockFn)

    expect(ship.cruiserFitBonus).toBe(0)

    base.is.mockReturnValue(true)

    equipment.count.mockReturnValueOnce(2).mockReturnValueOnce(3)
    expect(ship.cruiserFitBonus).toBe(Math.sqrt(2) + 2 * Math.sqrt(3))

    equipment.count.mockImplementation((cb) => (cb({ gearId: GearId["14cm単装砲"] }) ? 2 : 0))
    expect(ship.cruiserFitBonus).toBe(Math.sqrt(2))
    equipment.count.mockImplementation((cb) => (cb({ gearId: GearId["15.2cm単装砲"] }) ? 3 : 0))
    expect(ship.cruiserFitBonus).toBe(Math.sqrt(3))

    equipment.count.mockImplementation((cb) => (cb({ gearId: GearId["15.2cm連装砲"] }) ? 2 : 0))
    expect(ship.cruiserFitBonus).toBe(2 * Math.sqrt(2))
    equipment.count.mockImplementation((cb) => (cb({ gearId: GearId["14cm連装砲"] }) ? 3 : 0))
    expect(ship.cruiserFitBonus).toBe(2 * Math.sqrt(3))
    equipment.count.mockImplementation((cb) => (cb({ gearId: GearId["15.2cm連装砲改"] }) ? 5 : 0))
    expect(ship.cruiserFitBonus).toBe(2 * Math.sqrt(5))
  })

  it("Zara砲補正 = sqrt(203mm/53 連装砲の本数)", () => {
    const [base, stats, equipment] = getMocks()
    base.shipClass = ShipClass.ZaraClass
    const ship = new ShipImpl(base, stats, equipment, getNextBonusesMockFn)

    equipment.count.mockReturnValueOnce(2)
    expect(ship.cruiserFitBonus).toBe(Math.sqrt(2))
  })

  it("isCarrierLike", () => {
    const [base, stats, equipment] = getMocks()
    const ship = new ShipImpl(base, stats, equipment, getNextBonusesMockFn)

    expect(ship.isCarrierLike).toBe(false)

    base.is.mockImplementationOnce((attr: ShipAttribute) => attr === "AircraftCarrierClass")
    expect(ship.isCarrierLike).toBe(true)

    base.is.mockImplementation((attr: ShipAttribute) => attr === "Installation")
    equipment.has.mockReturnValueOnce(true)
    expect(ship.isCarrierLike).toBe(true)
  })

  it("速吸改かつ(艦攻|艦爆|噴式爆|噴式攻)装備なら、isCarrierLikeはtrue", () => {
    const [base, stats, equipment] = getMocks()
    base.shipId = ShipId["速吸改"]
    const ship = new ShipImpl(base, stats, equipment, getNextBonusesMockFn)

    equipment.has
      .mockImplementationOnce((cb) => cb(GearStub.fromCategory("CbDiveBomber")))
      .mockImplementationOnce((cb) => cb(GearStub.fromCategory("CbTorpedoBomber")))
      .mockImplementationOnce((cb) => cb(GearStub.fromCategory("JetFighterBomber")))
      .mockImplementationOnce((cb) => cb(GearStub.fromCategory("JetTorpedoBomber")))
      .mockImplementationOnce((cb) => cb(GearStub.fromCategory("SeaplaneBomber")))

    expect(ship.isCarrierLike).toBe(true)
    expect(ship.isCarrierLike).toBe(true)
    expect(ship.isCarrierLike).toBe(true)
    expect(ship.isCarrierLike).toBe(true)
    expect(ship.isCarrierLike).toBe(false)
  })

  it("陸上かつ(艦攻|艦爆|噴式爆|噴式攻)装備なら、isCarrierLikeはtrue", () => {
    const [base, stats, equipment] = getMocks()
    const ship = new ShipImpl(ShipCommonBaseStub.fromAttrs("Installation"), stats, equipment, getNextBonusesMockFn)

    equipment.has
      .mockImplementationOnce((cb) => cb(GearStub.fromCategory("CbDiveBomber")))
      .mockImplementationOnce((cb) => cb(GearStub.fromCategory("CbTorpedoBomber")))
      .mockImplementationOnce((cb) => cb(GearStub.fromCategory("JetFighterBomber")))
      .mockImplementationOnce((cb) => cb(GearStub.fromCategory("JetTorpedoBomber")))
      .mockImplementationOnce((cb) => cb(GearStub.fromCategory("SeaplaneBomber")))

    expect(ship.isCarrierLike).toBe(true)
    expect(ship.isCarrierLike).toBe(true)
    expect(ship.isCarrierLike).toBe(true)
    expect(ship.isCarrierLike).toBe(true)
    expect(ship.isCarrierLike).toBe(false)
  })

  it("対艦空撃力 = [装備雷装 + [1.3 * 装備爆装]] + 15", () => {
    const [base, stats, equipment] = getMocks()
    const ship = new ShipImpl(base, stats, equipment, getNextBonusesMockFn)
    stats.torpedo.equipment = 12
    equipment.sumBy.mockReturnValueOnce(6)

    expect(ship.calcAirPower()).toBe(Math.floor(12 + Math.floor(1.3 * 6)) + 15)
  })

  it("対地空撃力 = [1.3 * 対地爆装] + 15", () => {
    const [base, stats, equipment] = getMocks()
    const ship = new ShipImpl(base, stats, equipment, getNextBonusesMockFn)
    stats.torpedo.equipment = 100
    equipment.sumBy.mockReturnValueOnce(6)

    expect(ship.calcAirPower(true)).toBe(Math.floor(1.3 * 6) + 15)
  })

  it("基礎命中項 = 2 * sqrt(lv) + 1.5 * sqrt(運)", () => {
    const [base, stats, equipment] = getMocks()
    stats.level = 175
    stats.luck.displayed = 110
    const ship = new ShipImpl(base, stats, equipment, getNextBonusesMockFn)

    expect(ship.basicAccuracyTerm).toBe(2 * Math.sqrt(175) + 1.5 * Math.sqrt(110))
  })

  it("基礎回避項 = 回避 + sqrt(2 * 運)", () => {
    const [base, stats, equipment] = getMocks()
    stats.evasion.displayed = 120
    stats.luck.displayed = 110
    const ship = new ShipImpl(base, stats, equipment, getNextBonusesMockFn)

    expect(ship.basicEvasionTerm).toBe(120 + Math.sqrt(2 * 110))
  })
})
