import {
  ShipData,
  ShipClass,
  ShipClassKey,
  ShipType,
  HullCode,
  equippable as equippableData,
  ShipId,
  ShipRuby,
} from "@fleethub/data"
import { ShipAttribute, createShipAttrs } from "./ShipAttribute"
import { SpeedGroup } from "./Speed"

enum SpeedValue {
  Slow = 5,
  Fast = 10,
  FastPlus = 15,
  Fastest = 20,
}

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

export type StatBase = [number, number]

export interface RequiredShipData extends Required<ShipData> {
  hp: StatBase

  firepower: StatBase
  armor: StatBase
  torpedo: StatBase
  antiAir: StatBase

  evasion: StatBase
  asw: StatBase
  los: StatBase

  luck: StatBase

  gears: Array<{ gearId: number; stars?: number }>
}

export interface ShipBase extends RequiredShipData {
  shipId: number

  attrs: ShipAttribute[]
  isCommonly: boolean
  rank: number
  equippable: Equippable

  shipClassIn: (...keys: ShipClassKey[]) => boolean
  shipTypeIn: (...keys: HullCode[]) => boolean
  is: (attr: ShipAttribute) => boolean

  speedGroup: SpeedGroup
}

const toStatBase = (stat: ShipData["firepower"] = 0): StatBase => {
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

export const toRequiredShipData = (partial: Partial<ShipData>): RequiredShipData => ({
  id: partial.id ?? 0,

  shipClass: partial.shipClass ?? 0,
  shipType: partial.shipType ?? 0,
  name: partial.name ?? "",
  ruby: partial.ruby ?? "",

  sortNo: partial.sortNo ?? 0,
  sortId: partial.sortId ?? 0,

  hp: toStatBase(partial.hp),
  armor: toStatBase(partial.armor),
  firepower: toStatBase(partial.firepower),
  torpedo: toStatBase(partial.torpedo),
  antiAir: toStatBase(partial.antiAir),
  luck: toStatBase(partial.luck),
  asw: toStatBase(partial.asw),
  evasion: toStatBase(partial.evasion),
  los: toStatBase(partial.los),

  speed: partial.speed ?? 0,
  range: partial.range ?? 0,

  fuel: partial.fuel ?? 0,
  ammo: partial.ammo ?? 0,

  slots: (partial.slots ?? []).concat(),
  gears: (partial.gears ?? []).map((gear) => {
    if (typeof gear === "number") {
      return { gearId: gear }
    }
    return gear
  }),

  nextId: partial.nextId ?? 0,
  nextLevel: partial.nextLevel ?? 0,
  convertible: false,
})

export default class MasterShip implements ShipBase {
  public readonly id = this.data.id || 0

  public readonly shipClass = this.data.shipClass || 0
  public readonly shipType = this.data.shipType || 0
  public readonly name = this.data.name || ""
  public readonly ruby = this.data.ruby || ""

  public readonly sortNo = this.data.sortNo || 0
  public readonly sortId = this.data.sortId || 0

  public readonly hp = toStatBase(this.data.hp)
  public readonly armor = toStatBase(this.data.armor)
  public readonly firepower = toStatBase(this.data.firepower)
  public readonly torpedo = toStatBase(this.data.torpedo)
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

  get speedGroup(): SpeedGroup {
    const { shipId } = this

    const isFastAV = this.speed === SpeedValue.Fast && this.shipType === ShipType.AV

    if (
      isFastAV ||
      this.is("SubmarineClass") ||
      [ShipId["夕張"], ShipId["夕張改"]].includes(shipId) ||
      this.shipClassIn("KagaClass", "AkitsuMaruClass", "RepairShip", "RevisedKazahayaClass")
    ) {
      return SpeedGroup.OtherC
    }

    if (
      this.shipClassIn("ShimakazeClass", "TashkentClass", "TaihouClass", "ShoukakuClass", "ToneClass", "MogamiClass")
    ) {
      return SpeedGroup.FastA
    }

    if (this.shipClassIn("AganoClass", "SouryuuClass", "HiryuuClass", "KongouClass", "YamatoClass", "IowaClass")) {
      return SpeedGroup.FastB1SlowA
    }

    const ruby = this.ruby as ShipRuby
    const isAmatsukaze = ruby === "あまつかぜ"
    const isUnryuu = ruby === "うんりゅう"
    const isAmagi = ruby === "あまぎ"
    const isNagatoKai2 = shipId === ShipId["長門改二"]

    if (isAmatsukaze || isUnryuu || isAmagi || isNagatoKai2) {
      return SpeedGroup.FastB1SlowA
    }

    return SpeedGroup.FastB2SlowB
  }
}
