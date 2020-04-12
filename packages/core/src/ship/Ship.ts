import { GearId, ShipId, GearCategory, ShipClass } from "@fleethub/data"

import { Equipment } from "../equipment"
import { GearBase, Gear } from "../gear"

import { ShipStats } from "./ShipStats"
import { ShipBase } from "./MasterShip"
import { Health } from "./Health"
import { getNextEquipmentBonuses, EquipmentBonuses, createEquipmentBonuses, subtract } from "./EquipmentBonuses"

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

  public readonly is = this.base.is

  constructor(
    private base: PickedShipBase,
    private stats: ShipStats,
    private bonuses: EquipmentBonuses,
    public equipment: Equipment,
    public health: Health
  ) {}

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

  private isExslot = (index: number) => this.equipment.defaultSlots.length <= index

  public canEquip = (index: number, gear: GearBase) => {
    const { shipId, shipClass } = this
    const { equippable } = this.base
    const { gearId, specialCategory } = gear

    if (this.is("Abyssal")) {
      return true
    }

    if (!equippable.categories.includes(specialCategory)) {
      return false
    }

    // Richelieu
    if (
      [ShipId["Richelieu"], ShipId["Richelieu改"]].includes(shipId) &&
      specialCategory === GearCategory.SeaplaneBomber
    ) {
      return gearId === GearId["Laté 298B"]
    }

    if (this.is("RoyalNavy") && this.is("BattleshipClass") && specialCategory === GearCategory.SeaplaneBomber) {
      return [GearId["Swordfish(水上機型)"], GearId["Swordfish Mk.III改(水上機型)"]].includes(gearId)
    }

    if (this.isExslot(index)) {
      return (
        equippable.exslotCategories.includes(specialCategory) ||
        equippable.exslot.includes(gearId) ||
        gearId === GearId["改良型艦本式タービン"]
      )
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

  public getNextEquipmentBonuses = (omitIndex: number, gear: Gear | GearBase) => {
    const current = this.bonuses

    const gears = this.equipment.filter((gear, index) => index !== omitIndex)
    const next = createEquipmentBonuses(this, [...gears, gear])

    return subtract(next, current)
  }
}
