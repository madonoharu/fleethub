import { Equipment } from "../equipment/Equipment"

import { ShipStats } from "./ShipStats"
import { ShipBase } from "./MasterShip"
import { Health } from "./Health"

type PickedShipBase = Pick<ShipBase, "id" | "sortId" | "shipClass" | "shipType" | "name" | "ruby" | "remodelGroup">

export type Ship = {
  shipId: number
  level: number
  equipment: Equipment
} & Omit<PickedShipBase, "id"> &
  ShipStats

export class ShipImpl implements Ship {
  constructor(
    private base: PickedShipBase,
    private stats: ShipStats,
    public equipment: Equipment,
    public health: Health
  ) {}

  get shipId() {
    return this.base.id
  }
  get sortId() {
    return this.base.sortId
  }
  get shipClass() {
    return this.base.shipClass
  }
  get shipType() {
    return this.base.shipClass
  }
  get name() {
    return this.base.name
  }
  get ruby() {
    return this.base.ruby
  }
  get remodelGroup() {
    return this.base.remodelGroup
  }

  get level() {
    return this.stats.level
  }

  get firepower() {
    return this.stats.firepower
  }
  get torpedo() {
    return this.stats.torpedo
  }
  get antiAir() {
    return this.stats.antiAir
  }
  get armor() {
    return this.stats.armor
  }

  get asw() {
    return this.stats.asw
  }
  get los() {
    return this.stats.los
  }
  get evasion() {
    return this.stats.evasion
  }

  get maxHp() {
    return this.stats.maxHp
  }
  get luck() {
    return this.stats.luck
  }
}
