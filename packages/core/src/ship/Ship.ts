import { GearId, ShipId, GearCategory, ShipClass } from "@fleethub/data"

import { Equipment } from "../equipment"
import { GearBase } from "../gear"

import { ShipBase } from "./MasterShip"
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

export type Ship = Pick<ShipBase, "shipId" | "sortId" | "shipClass" | "shipType" | "name" | "ruby" | "is"> &
  ShipStats & {
    level: number
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

  public readonly is = this.base.is

  constructor(private base: ShipBase, private stats: ShipStats, public equipment: Equipment, public health: Health) {}

  private isExslot = (index: number) => this.equipment.defaultSlots.length <= index

  public canEquip = (index: number, gear: GearBase) => {
    const { shipClass } = this
    const { equippable } = this.base
    const { gearId, specialCategory } = gear

    if (this.is("Abyssal")) {
      return true
    }

    if (!equippable.categories.includes(specialCategory)) {
      return false
    }

    if (this.isExslot(index)) {
      return (
        equippable.exslotCategories.includes(specialCategory) ||
        equippable.exslotIds.includes(gearId) ||
        gearId === GearId["改良型艦本式タービン"]
      )
    }

    if (shipClass === ShipClass.RichelieuClass && specialCategory === GearCategory.SeaplaneBomber) {
      return gearId === GearId["Laté 298B"]
    }

    if (shipClass === ShipClass.IseClass && this.is("Kai2")) {
      return !(index > 1 && gear.is("MainGun"))
    }

    if (shipClass === ShipClass.YuubariClass && this.is("Kai2")) {
      if (index >= 3 && (gear.is("MainGun") || gear.categoryIn("Torpedo", "MidgetSubmarine"))) {
        return false
      }
      if (index === 4) {
        return gear.categoryIn("AntiAirGun", "SmallRadar", "CombatRation")
      }
    }

    return true
  }

  get fleetLosFactor() {
    const observationSeaplaneModifier = this.equipment.sumBy((gear, i, slotSize) => {
      if (!slotSize || !gear.is("ObservationSeaplane")) return 0

      return gear.los * Math.floor(Math.sqrt(slotSize))
    })

    return this.los.naked + observationSeaplaneModifier
  }
}
