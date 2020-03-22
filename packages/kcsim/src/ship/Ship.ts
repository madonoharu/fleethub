import { ShipStats } from "./ShipStat"
import { ShipBase } from "./MasterShip"

type PickedShipBase = Pick<ShipBase, "sortId" | "shipClass" | "shipType" | "name" | "ruby" | "remodelGroup">

export default class Ship implements PickedShipBase, ShipStats {
  constructor(private base: { id: ShipBase["id"] } & PickedShipBase, private stats: ShipStats) {}

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
