import { Equipment } from "../equipment"
import { GearBase } from "../gear"

import { ShipStats, ShipCommonBase } from "./types"

export type Ship = ShipCommonBase &
  ShipStats & {
    equipment: Equipment
    canEquip: (index: number, gear: GearBase) => boolean

    fleetLosFactor: number
  }

export class ShipImpl implements Ship {
  public readonly shipId = this.base.shipId
  public readonly sortId = this.base.sortId
  public readonly shipClass = this.base.shipClass
  public readonly shipType = this.base.shipType
  public readonly name = this.base.name
  public readonly ruby = this.base.ruby

  public readonly level = this.stats.level

  public readonly firepower = this.stats.firepower
  public readonly torpedo = this.stats.torpedo
  public readonly antiAir = this.stats.antiAir
  public readonly armor = this.stats.armor
  public readonly asw = this.stats.asw
  public readonly los = this.stats.los
  public readonly evasion = this.stats.evasion

  public readonly maxHp = this.stats.maxHp
  public readonly speed = this.stats.speed
  public readonly range = this.stats.range
  public readonly luck = this.stats.luck

  public readonly health = this.stats.health
  public readonly morale = this.stats.morale
  public readonly ammo = this.stats.ammo
  public readonly fuel = this.stats.fuel

  public readonly is = this.base.is
  public readonly canEquip = this.base.canEquip

  constructor(private base: ShipCommonBase, private stats: ShipStats, public equipment: Equipment) {}

  get fleetLosFactor() {
    const observationSeaplaneModifier = this.equipment.sumBy((gear, i, slotSize) => {
      if (!slotSize || !gear.is("ObservationSeaplane")) return 0

      return gear.los * Math.floor(Math.sqrt(slotSize))
    })

    return this.los.naked + observationSeaplaneModifier
  }
}
