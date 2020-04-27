import { ShipStat, ShipStats } from "../ship/Ship"

export class ShipStatStub implements Required<ShipStat> {
  public key = "" as any
  public displayed = 0
  public naked = 0
  public left = 0
  public right = 0
  public modernization = 0
  public equipment = 0
  public bonus = 0
}

export default class ShipStatsStub implements ShipStats {
  level = 0
  maxHp = new ShipStatStub()
  firepower = new ShipStatStub()
  torpedo = new ShipStatStub()
  antiAir = new ShipStatStub()
  armor = new ShipStatStub()
  asw = new ShipStatStub()
  los = new ShipStatStub()
  evasion = new ShipStatStub()
  speed = new ShipStatStub()
  luck = new ShipStatStub()
  range = new ShipStatStub()
}
