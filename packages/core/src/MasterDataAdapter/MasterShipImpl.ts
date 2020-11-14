import { MasterDataShip, ShipType, ShipClass, ShipAttribute, GearId, ShipId, ShipYomi } from "@fleethub/utils"

import { GearKey } from "../common"

import { MasterGear } from "./MasterGearImpl"

export enum SpeedValue {
  Slow = 5,
  Fast = 10,
  FastPlus = 15,
  Fastest = 20,
}

/**
 * 潜在艦速区分
 */
export type SpeedGroup = "FastA" | "FastB1SlowA" | "FastB2SlowB" | "OtherC"

export type MasterShipEquippable = {
  /** 装備カテゴリによる設定 */
  categoryIds: number[]
  /** 補強増設に装備カテゴリ */
  exslotCategoryIds: number[]
  /** 補強増設に装備できる追加ID一覧 */
  exslotIds: number[]
}

export const shipCategoies = [
  "Battleship",
  "AircraftCarrier",
  "HeavyCruiser",
  "LightCruiser",
  "Destroyer",
  "CoastalDefenseShip",
  "Submarine",
  "SupportShip",
] as const

export type ShipCategory = typeof shipCategoies[number]

type MasterShipAdditionalData = {
  shipType: ShipType
  shipClass: ShipClass
  shipTypeName: string
  shipClassName: string
  attrs: ShipAttribute[]
  equippable: MasterShipEquippable
}

export type MasterShip = Required<MasterDataShip> &
  Omit<MasterShipAdditionalData, "equippable"> & {
    shipId: number
    rank: number
    category: ShipCategory
    speedGroup: SpeedGroup
    isAbyssal: boolean
    isCommonly: boolean
    is: (attr: ShipAttribute) => boolean
    canEquip: (gear: MasterGear, key?: GearKey) => boolean
    shipClassIn: (...classes: ShipClass[]) => boolean
    shipTypeIn: (...types: ShipType[]) => boolean
  }

export default class MasterShipImpl implements MasterShip {
  public readonly id = this.data.id
  public readonly stype = this.data.stype
  public readonly ctype = this.data.ctype
  public readonly name = this.data.name
  public readonly yomi = this.data.yomi
  public readonly sortId = this.data.sortId || 0
  public readonly slotnum = this.data.slotnum
  public readonly banner = this.data.banner
  public readonly shipType = this.additionalData.shipType
  public readonly shipTypeName = this.additionalData.shipTypeName
  public readonly shipClass = this.additionalData.shipClass
  public readonly shipClassName = this.additionalData.shipClassName
  public readonly attrs = this.additionalData.attrs

  public readonly maxHp = this.data.maxHp
  public readonly firepower = this.data.firepower
  public readonly torpedo = this.data.torpedo
  public readonly armor = this.data.armor
  public readonly antiAir = this.data.antiAir
  public readonly luck = this.data.luck
  public readonly asw = this.data.asw
  public readonly evasion = this.data.evasion
  public readonly los = this.data.los

  public readonly speed = this.data.speed
  public readonly range = this.data.range

  public readonly fuel = this.data.fuel || 0
  public readonly ammo = this.data.ammo || 0

  public readonly slots = this.data.slots
  public readonly stock = this.data.stock

  public readonly nextId = this.data.nextId || 0
  public readonly nextLevel = this.data.nextLevel || 0
  public readonly convertible = this.data.convertible || false

  private readonly equippable = this.additionalData.equippable

  constructor(private data: MasterDataShip, private additionalData: MasterShipAdditionalData) {}

  get shipId() {
    return this.id
  }

  get isAbyssal() {
    return this.id > 1500
  }

  get isCommonly() {
    const { nextId, convertible, id } = this
    return nextId === 0 || convertible || [ShipId["千歳"], ShipId["千代田航"], ShipId["大鯨"]].includes(id)
  }

  get rank() {
    return this.sortId % 10
  }

  get category() {
    const { shipTypeIn } = this
    if (shipTypeIn("FBB", "BB", "BBV")) return "Battleship"
    if (shipTypeIn("CVL", "CV", "CVB")) return "AircraftCarrier"
    if (shipTypeIn("CA", "CAV")) return "HeavyCruiser"
    if (shipTypeIn("CL", "CLT", "CT")) return "LightCruiser"
    if (shipTypeIn("DD")) return "Destroyer"
    if (shipTypeIn("DE")) return "CoastalDefenseShip"
    if (shipTypeIn("SS", "SSV")) return "Submarine"
    return "SupportShip"
  }

  public is = (attr: ShipAttribute) => this.attrs.includes(attr)

  public shipClassIs = (shipClass: ShipClass) => this.shipClass === shipClass

  public shipClassIn = (...shipClasses: ShipClass[]) => shipClasses.some((shipClass) => shipClass === this.shipClass)

  public shipTypeIn = (...shipTypes: ShipType[]) => shipTypes.some((type) => type === this.shipType)

  public canEquip = (gear: MasterGear, key?: GearKey) => {
    const { shipClass, equippable, is } = this
    const { gearId, specialType2, categoryIs } = gear

    if (this.isAbyssal) return true

    if (!equippable.categoryIds.includes(specialType2)) {
      return false
    }

    if (!key) return true

    if (key === "gx") {
      return (
        equippable.exslotCategoryIds.includes(specialType2) ||
        equippable.exslotIds.includes(gearId) ||
        gearId === GearId["改良型艦本式タービン"]
      )
    }

    if (shipClass === "RichelieuClass" && categoryIs("SeaplaneBomber")) {
      return gearId === GearId["Laté 298B"]
    }

    const isKai2 = is("Kai2")

    if (shipClass === "IseClass" && isKai2) {
      return ["g1", "g2"].includes(key) || !gear.is("MainGun")
    }

    if (shipClass === "YuubariClass" && isKai2) {
      if (key === "g4") {
        return !(gear.is("MainGun") || gear.categoryIn("Torpedo", "MidgetSubmarine"))
      }
      if (key === "g5") {
        return gear.categoryIn("AntiAirGun", "SmallRadar", "CombatRation")
      }
    }

    return true
  }

  get speedGroup() {
    const { shipId, shipTypeIn, shipClassIn, speed } = this
    const isFastAV = speed === SpeedValue.Fast && shipTypeIn("AV")

    if (
      isFastAV ||
      shipTypeIn("SS", "SSV") ||
      [ShipId["夕張"], ShipId["夕張改"]].includes(shipId) ||
      shipClassIn("KagaClass", "AkatsukiClass", "RepairShip", "RevisedKazahayaClass")
    ) {
      return "OtherC"
    }

    if (shipClassIn("ShimakazeClass", "TashkentClass", "TaihouClass", "ShoukakuClass", "ToneClass", "MogamiClass")) {
      return "FastA"
    }

    if (shipClassIn("AganoClass", "SouryuuClass", "HiryuuClass", "KongouClass", "YamatoClass", "IowaClass")) {
      return "FastB1SlowA"
    }

    const yomi = this.yomi as ShipYomi
    const isAmatsukaze = yomi === "あまつかぜ"
    const isUnryuu = yomi === "うんりゅう"
    const isAmagi = yomi === "あまぎ"
    const isNagatoKai2 = shipId === ShipId["長門改二"]

    if (isAmatsukaze || isUnryuu || isAmagi || isNagatoKai2) {
      return "FastB1SlowA"
    }

    return "FastB2SlowB"
  }
}
