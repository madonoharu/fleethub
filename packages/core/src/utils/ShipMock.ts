import { Equipment } from "../equipment"
import { Ship, ShipStat } from "../ship"
import { HealthImpl } from "../ship/Health"

class EquipmentMock implements Equipment {
  public src = []
  public size = 0

  public defaultSlots = []
  public currentSlots = []

  public gears = []

  public forEach = jest.fn()
  public filter = jest.fn()
  public map = jest.fn()
  public sumBy = jest.fn()
  public maxValueBy = jest.fn()
  public has = jest.fn()
  public count = jest.fn()
  public hasAircraft = jest.fn()
  public countAircraft = jest.fn()
}

class ShipStatMock implements Required<ShipStat> {
  public key = "" as any
  public displayed = 0
  public naked = 0
  public left = 0
  public right = 0
  public modernization = 0
  public equipment = 0
  public bonus = 0
}

export default class ShipMock implements Ship {
  public name = ""
  public ruby = ""
  public shipId = 0
  public sortId = 0
  public shipType = 0
  public shipClass = 0

  public equipment = new EquipmentMock()

  public level = 0

  public firepower = new ShipStatMock()
  public torpedo = new ShipStatMock()
  public antiAir = new ShipStatMock()
  public armor = new ShipStatMock()
  public asw = new ShipStatMock()
  public los = new ShipStatMock()
  public evasion = new ShipStatMock()
  public maxHp = new ShipStatMock()
  public speed = new ShipStatMock()
  public range = new ShipStatMock()
  public luck = new ShipStatMock()

  public health = new HealthImpl(0)

  public is = jest.fn()
  public canEquip = jest.fn()

  public fleetLosFactor = 0
}
