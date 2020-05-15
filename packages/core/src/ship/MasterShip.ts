import {
  ShipData,
  ShipClass,
  ShipClassKey,
  ShipType,
  HullCode,
  equippable as equippableData,
  ShipId,
  GearId,
  GearCategory,
} from "@fleethub/data"
import { ShipAttribute, createShipAttrs } from "./ShipAttribute"
import { GearBase } from "../gear"
import { EquipmentGearKey } from "../equipment"

import { StatBase, ShipStatsBase, ShipCommonBaseWithStatsBase } from "./types"

type Equippable = {
  /** 装備カテゴリによる設定 */
  categories: number[]
  /** 補強増設に装備カテゴリ */
  exslotCategories: number[]
  /** 補強増設に装備できる追加ID一覧 */
  exslotIds: number[]
}

const createEquippable = (shipId: number, shipType: number): Equippable => {
  const shipTypeEquippable = equippableData.shipType.find(({ id }) => id === shipType)

  const shipEquippable = equippableData.ship.find(({ id }) => id === shipId)

  const { exslotCategories } = equippableData

  return {
    categories: [],
    exslotIds: [],
    ...shipTypeEquippable,
    ...shipEquippable,
    exslotCategories,
  }
}

export type RequiredShipData = ShipStatsBase &
  Required<Omit<ShipData, keyof ShipStatsBase>> & {
    gears: Array<{ gearId: number; stars?: number }>
  }

export interface ShipBase extends ShipCommonBaseWithStatsBase, RequiredShipData {
  attrs: ShipAttribute[]
  isCommonly: boolean
  rank: number
  equippable: Equippable
}

export const toStatBase = (stat: ShipData["firepower"] = 0): StatBase => {
  if (typeof stat === "number") {
    return [stat, stat]
  }
  return stat
}

const toShipBaseGears = (gears: ShipData["gears"] = []) =>
  gears.map((gear) => {
    if (typeof gear === "number") {
      return { gearId: gear }
    }
    return gear
  })

export default class MasterShip implements ShipBase {
  public readonly id = this.data.id || 0

  public readonly shipClass = this.data.shipClass || 0
  public readonly shipType = this.data.shipType || 0
  public readonly name = this.data.name || ""
  public readonly ruby = this.data.ruby || ""

  public readonly sortNo = this.data.sortNo || 0
  public readonly sortId = this.data.sortId || 0

  public readonly maxHp = toStatBase(this.data.maxHp)
  public readonly firepower = toStatBase(this.data.firepower)
  public readonly torpedo = toStatBase(this.data.torpedo)
  public readonly armor = toStatBase(this.data.armor)
  public readonly antiAir = toStatBase(this.data.antiAir)
  public readonly luck = toStatBase(this.data.luck)
  public readonly asw = toStatBase(this.data.asw)
  public readonly evasion = toStatBase(this.data.evasion)
  public readonly los = toStatBase(this.data.los)

  public readonly speed = this.data.speed || 0
  public readonly range = this.data.range || 0

  public readonly fuel = this.data.fuel || 0
  public readonly ammo = this.data.ammo || 0

  public readonly slots = this.data.slots || []
  public readonly gears = toShipBaseGears(this.data.gears)

  public readonly nextId = this.data.nextId || 0
  public readonly nextLevel = this.data.nextLevel || 0
  public readonly convertible = this.data.convertible || false

  public readonly equippable: Equippable

  public readonly attrs: ShipAttribute[]

  constructor(private data: Partial<ShipData>) {
    this.equippable = createEquippable(this.id, this.shipType)
    this.attrs = createShipAttrs(this)
  }

  get shipId() {
    return this.id
  }

  get isCommonly() {
    const { nextId, convertible, id } = this
    return nextId === 0 || convertible || [ShipId["千歳"], ShipId["千代田航"], ShipId["大鯨"]].includes(id)
  }

  get rank() {
    return this.sortId % 10
  }

  public is = (attr: ShipAttribute) => this.attrs.includes(attr)

  public shipClassIn = (...keys: ShipClassKey[]) => keys.some((key) => ShipClass[key] === this.shipClass)

  public shipTypeIn = (...keys: HullCode[]) => keys.some((key) => ShipType[key] === this.shipType)

  public canEquip = (key: EquipmentGearKey, gear: GearBase) => {
    const { shipClass, equippable } = this
    const { gearId, specialCategory } = gear

    if (this.is("Abyssal")) {
      return true
    }

    if (!equippable.categories.includes(specialCategory)) {
      return false
    }

    if (key === "gx") {
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
      return ["g1", "g2"].includes(key) || !gear.is("MainGun")
    }

    if (shipClass === ShipClass.YuubariClass && this.is("Kai2")) {
      if (key === "g4") {
        return !(gear.is("MainGun") || gear.categoryIn("Torpedo", "MidgetSubmarine"))
      }
      if (key === "g5") {
        return gear.categoryIn("AntiAirGun", "SmallRadar", "CombatRation")
      }
    }

    return true
  }
}
