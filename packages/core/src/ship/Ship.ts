import { GearId, ShipId, GearCategory, ShipClass } from "@fleethub/data"

import { Equipment } from "../equipment"
import { GearBase, Gear } from "../gear"

import { ShipStats } from "./ShipStats"
import { ShipBase } from "./MasterShip"
import { Health } from "./Health"

type PickedShipBase = Pick<
  ShipBase,
  "id" | "sortId" | "shipClass" | "shipType" | "name" | "ruby" | "remodelGroup" | "equippable" | "is"
>

export type Ship = Omit<PickedShipBase, "id" | "equippable"> &
  ShipStats & {
    shipId: number
    level: number
    equipment: Equipment

    canEquip: (index: number, gear: GearBase) => boolean
  }

export class ShipImpl implements Ship {
  public readonly shipId = this.base.id
  public readonly sortId = this.base.sortId
  public readonly shipClass = this.base.shipClass
  public readonly shipType = this.base.shipType
  public readonly name = this.base.name
  public readonly ruby = this.base.ruby
  public readonly remodelGroup = this.base.remodelGroup

  public readonly level = this.stats.level

  public readonly firepower = this.stats.firepower
  public readonly torpedo = this.stats.torpedo
  public readonly antiAir = this.stats.antiAir
  public readonly armor = this.stats.armor

  public readonly asw = this.stats.asw
  public readonly los = this.stats.los
  public readonly evasion = this.stats.evasion

  public readonly maxHp = this.stats.maxHp
  public readonly range = this.stats.range
  public readonly luck = this.stats.luck

  public readonly is = this.base.is

  constructor(
    private base: PickedShipBase,
    private stats: ShipStats,
    public equipment: Equipment,
    public health: Health
  ) {}

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
        return gear.categoryIn("AntiAircraftGun", "SmallRadar", "CombatRation")
      }
    }

    return true
  }
}
