import { GearId, ShipId, GearCategory, ShipClass } from "@fleethub/data"

import { Equipment } from "../equipment"
import { GearBase } from "../gear"

import { ShipStats } from "./ShipStats"
import { ShipBase } from "./MasterShip"
import { Health } from "./Health"
import { ShipAttribute } from "./ShipAttribute"

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

  get is() {
    return this.base.is
  }

  private isExslot = (index: number) => this.equipment.initialSlots.length <= index

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
}
