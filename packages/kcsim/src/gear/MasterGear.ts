import { GearData, GearCategory2, GearId, GearCategory, GearCategoryKey } from "@fleethub/data"
import { GearAttribute, createGearAttrs } from "./GearAttribute"

const defaultStats: Required<GearData> = {
  id: 0,

  category: 0,
  iconId: 0,
  name: "",

  hp: 0,
  firepower: 0,
  armor: 0,
  torpedo: 0,
  antiAir: 0,
  speed: 0,
  bombing: 0,
  asw: 0,
  los: 0,
  luck: 0,
  accuracy: 0,
  evasion: 0,
  antiBomber: 0,
  interception: 0,
  range: 0,
  radius: 0,
  cost: 0,

  improvable: false,
}

export const toRequiredGearData = (data: Partial<GearData>): Required<GearData> => ({ ...defaultStats, ...data })

export interface GearBase extends Required<GearData> {
  attrs: GearAttribute[]
  equippableCategory: number

  in: (...attrs: GearAttribute[]) => boolean
  categoryIn: (...categories: GearCategoryKey[]) => boolean
}

export default class MasterGear implements GearBase {
  public readonly id: number

  public readonly category: number
  public readonly iconId: number
  public readonly name: string

  public readonly firepower: number
  public readonly armor: number
  public readonly torpedo: number
  public readonly antiAir: number
  public readonly bombing: number
  public readonly asw: number
  public readonly los: number

  public readonly accuracy: number
  public readonly evasion: number
  public readonly antiBomber: number
  public readonly interception: number

  public readonly range: number
  public readonly radius: number
  public readonly cost: number

  public readonly improvable: boolean

  public readonly hp: number
  public readonly speed: number
  public readonly luck: number

  public readonly attrs: GearAttribute[]

  constructor(partial: Partial<GearData>) {
    const data = toRequiredGearData(partial)

    this.id = data.id

    this.category = data.category
    this.iconId = data.iconId
    this.name = data.name

    this.hp = data.hp
    this.firepower = data.firepower
    this.armor = data.armor
    this.torpedo = data.torpedo
    this.antiAir = data.antiAir
    this.speed = data.speed
    this.bombing = data.bombing
    this.asw = data.asw
    this.los = data.los
    this.luck = data.luck
    this.accuracy = data.accuracy
    this.evasion = data.evasion
    this.antiBomber = data.antiBomber
    this.interception = data.interception
    this.range = data.range
    this.radius = data.radius
    this.cost = data.cost

    this.improvable = data.improvable

    this.attrs = createGearAttrs(this)
  }

  get equippableCategory() {
    switch (this.id) {
      case GearId["試製51cm連装砲"]:
      case GearId["51cm連装砲"]:
        return GearCategory2.LargeCaliberMainGun2
      case GearId["15m二重測距儀+21号電探改二"]:
        return GearCategory2.LargeRadar2
      case GearId["試製景雲(艦偵型)"]:
        return GearCategory2.CarrierBasedReconnaissanceAircraft2
    }

    return this.category
  }

  public is = (attr: GearAttribute) => this.attrs.includes(attr)

  public in = (...attrs: GearAttribute[]) => attrs.some(this.is)

  public categoryIs = (key: GearCategoryKey) => this.category === GearCategory[key]

  public categoryIn = (...keys: GearCategoryKey[]) => keys.some(this.categoryIs)
}
