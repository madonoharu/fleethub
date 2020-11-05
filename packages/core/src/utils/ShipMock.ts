import { ShipClass, ShipType } from "@fleethub/utils"
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
  public yomi = ""
  public shipId = 0
  public sortId = 0
  public stype = 0
  public ctype = 0
  public shipType = "" as ShipType
  public shipClass = "" as ShipClass
  public category = "" as Ship["category"]
  public convertible = false
  public banner = ""
  public attrs = []
  public rank = 0
  public speedGroup = "OtherC" as const
  public isAbyssal = false
  public isCommonly = false

  public state = {} as any

  public equipment = new EquipmentMock()

  public is = jest.fn()
  public canEquip = jest.fn()
  public makeGetNextBonuses = jest.fn()

  public fleetLosFactor = 0
  public cruiserFitBonus = 0
  public isCarrierLike = false
  public calcAirPower = jest.fn()

  public basicAccuracyTerm = 0
  basicEvasionTerm = NaN
  fleetAntiAir = NaN
  shipClassIn = jest.fn()
  shipTypeIn = jest.fn()
}
