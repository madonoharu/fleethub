import { Equipment } from "../equipment"
import { Ship, ShipStat } from "../ship"
import { HealthImpl } from "../ship/Health"

import EquipmentMock from "./EquipmentMock"
import { ShipStatStub } from "./ShipStatsStub"

export default class ShipMock implements Ship {
  public name = ""
  public ruby = ""
  public shipId = 0
  public sortId = 0
  public shipType = 0
  public shipClass = 0

  public equipment = new EquipmentMock()

  public level = 0

  public firepower = new ShipStatStub()
  public torpedo = new ShipStatStub()
  public antiAir = new ShipStatStub()
  public armor = new ShipStatStub()
  public asw = new ShipStatStub()
  public los = new ShipStatStub()
  public evasion = new ShipStatStub()
  public maxHp = new ShipStatStub()
  public speed = new ShipStatStub()
  public range = new ShipStatStub()
  public luck = new ShipStatStub()

  public health = new HealthImpl(0)

  public is = jest.fn()
  public canEquip = jest.fn()

  public fleetLosFactor = 0
}
