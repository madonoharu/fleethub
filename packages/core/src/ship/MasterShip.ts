import {
  ShipData,
  ShipClass,
  ShipType,
  ShipClassKey,
  ShipTypeKey,
  equippable as equippableData,
  RemodelGroup,
  ShipId,
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
  exslot: number[]
}

const createEquippable = (shipId: number, shipType: number): Equippable => {
  const shipTypeEquippable = equippableData.shipType.find(({ id }) => id === shipType)

  const shipEquippable = equippableData.ship.find(({ id }) => id === shipId)

  const exslotCategories = equippableData.exslot

  return {
    categories: [],
    exslot: [],
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
  attrs: ShipAttribute[]
  canRemodel: boolean
  rank: number
  remodelGroup: number
  equippable: Equippable

  is: (attr: ShipAttribute) => boolean
}

const toStatBase = (stat: ShipData["firepower"] = 0): StatBase => {
  if (typeof stat === "number") {
    return [stat, stat]
  }
  return stat
}

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
})

export default class MasterShip implements ShipBase {
  public readonly id: number

  public readonly shipClass: number
  public readonly shipType: number
  public readonly name: string
  public readonly ruby: string

  public readonly sortNo: number
  public readonly sortId: number

  public readonly hp: StatBase
  public readonly armor: StatBase
  public readonly firepower: StatBase
  public readonly torpedo: StatBase
  public readonly antiAir: StatBase
  public readonly luck: StatBase
  public readonly asw: StatBase
  public readonly evasion: StatBase
  public readonly los: StatBase

  public readonly speed: number
  public readonly range: number

  public readonly fuel: number
  public readonly ammo: number

  public readonly slots: number[]
  public readonly gears: Array<{ gearId: number; stars?: number }>

  public readonly nextId: number
  public readonly nextLevel: number

  public readonly equippable: Equippable

  public readonly attrs: ShipAttribute[]

  constructor(partial: Partial<ShipData>) {
    const data = toRequiredShipData(partial)
    this.id = data.id

    this.shipClass = data.shipClass
    this.shipType = data.shipType
    this.name = data.name
    this.ruby = data.ruby

    this.sortNo = data.sortNo
    this.sortId = data.sortId

    this.hp = data.hp
    this.armor = data.armor
    this.firepower = data.firepower
    this.torpedo = data.torpedo
    this.antiAir = data.antiAir
    this.luck = data.luck
    this.asw = data.asw
    this.evasion = data.evasion
    this.los = data.los

    this.speed = data.speed
    this.range = data.range

    this.fuel = data.fuel
    this.ammo = data.ammo

    this.slots = data.slots

    this.gears = data.gears

    this.nextId = data.nextId
    this.nextLevel = data.nextLevel

    this.equippable = createEquippable(data.id, data.shipType)

    this.attrs = createShipAttrs(this)
  }

  get canRemodel() {
    return this.nextId > 0
  }

  get rank() {
    return this.sortId % 10
  }

  public readonly remodelGroup = 0

  public is = (attr: ShipAttribute) => this.attrs.includes(attr)

  public shipClassIn = (...keys: ShipClassKey[]) => keys.some((key) => ShipClass[key] === this.shipClass)

  public shipTypeIn = (...keys: ShipTypeKey[]) => keys.some((key) => ShipType[key] === this.shipType)

  get speedGroup(): SpeedGroup {
    const { id: shipId, remodelGroup } = this

    const isFastAV = this.speed === SpeedValue.Fast && this.shipTypeIn("SeaplaneTender")

    if (
      isFastAV ||
      this.shipTypeIn("Submarine", "SubmarineAircraftCarrier") ||
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

    const isAmatsukaze = remodelGroup === RemodelGroup["天津風"]
    const isUnryuu = remodelGroup === RemodelGroup["雲龍"]
    const isAmagi = remodelGroup === RemodelGroup["天城"]
    const isNagatoKai2 = shipId === ShipId["長門改二"]

    if (isAmatsukaze || isUnryuu || isAmagi || isNagatoKai2) {
      return SpeedGroup.FastB1SlowA
    }

    return SpeedGroup.FastB2SlowB
  }
}
