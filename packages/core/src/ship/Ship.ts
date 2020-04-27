import { Equipment } from "../equipment"
import { GearBase } from "../gear"

import { ShipCommonBase } from "./MasterShip"
import { Health } from "./Health"

type BasicStatKey = "firepower" | "torpedo" | "antiAir" | "armor"
type IncreasingStatKey = "asw" | "los" | "evasion"

type EquipmentRelatedStatKey = BasicStatKey | IncreasingStatKey
export type ShipStatKey = EquipmentRelatedStatKey | "maxHp" | "speed" | "luck" | "range"

export type ShipStat = {
  key: ShipStatKey
  displayed: number
  left?: number
  right?: number
  modernization?: number
  equipment?: number
  bonus?: number
  naked?: number
}

type EquipmentRelatedStat = Required<ShipStat>

export type ShipStats = Record<EquipmentRelatedStatKey, EquipmentRelatedStat> & {
  level: number
  maxHp: ShipStat
  speed: ShipStat
  range: ShipStat
  luck: ShipStat
}

export type Ship = ShipCommonBase &
  ShipStats & {
    equipment: Equipment
    health: Health
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

  public readonly is = this.base.is
  public readonly canEquip = this.base.canEquip

  constructor(
    private base: ShipCommonBase,
    private stats: ShipStats,
    public equipment: Equipment,
    public health: Health
  ) {}

  get fleetLosFactor() {
    const observationSeaplaneModifier = this.equipment.sumBy((gear, i, slotSize) => {
      if (!slotSize || !gear.is("ObservationSeaplane")) return 0

      return gear.los * Math.floor(Math.sqrt(slotSize))
    })

    return this.los.naked + observationSeaplaneModifier
  }
}
