import { Ship } from "../ship"
import { ShipStats } from "../ship/types"

import { EquipmentMock } from "./EquipmentMock"

export class ShipStatsStub implements ShipStats {
  level = NaN
  firepower = {} as ShipStats["firepower"]
  torpedo = {} as ShipStats["torpedo"]
  antiAir = {} as ShipStats["antiAir"]
  armor = {} as ShipStats["armor"]
  asw = {} as ShipStats["asw"]
  los = {} as ShipStats["los"]
  evasion = {} as ShipStats["evasion"]
  maxHp = {} as ShipStats["maxHp"]
  speed = {} as ShipStats["speed"]
  luck = {} as ShipStats["luck"]
  range = {} as ShipStats["range"]
  accuracy = {} as ShipStats["accuracy"]
  health = {} as ShipStats["health"]
  morale = {} as ShipStats["morale"]
  ammo = {} as ShipStats["ammo"]
  fuel = {} as ShipStats["fuel"]
}

export class ShipMock extends ShipStatsStub implements Ship {
  public name = ""
  public ruby = ""
  public shipId = 0
  public sortId = 0
  public shipType = 0
  public shipClass = 0

  public state = {} as any

  public equipment = new EquipmentMock()

  public is = jest.fn()
  public canEquip = jest.fn()
  public createNextBonusesGetter = jest.fn()

  public fleetLosFactor = 0
  public cruiserFitBonus = 0
  public isCarrierLike = false
  public calcAirPower = jest.fn()

  public basicAccuracyTerm = 0
}
