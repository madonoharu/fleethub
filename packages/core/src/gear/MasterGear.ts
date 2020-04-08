import { GearData, GearCategory2, GearId, GearCategory, GearCategoryKey } from "@fleethub/data"
import { GearAttribute, createGearAttrs } from "./GearAttribute"

export interface GearBase extends Required<GearData> {
  attrs: GearAttribute[]
  specialCategory: number

  gearId: number

  is: (attr: GearAttribute) => boolean
  in: (...attrs: GearAttribute[]) => boolean
  categoryIn: (...categories: GearCategoryKey[]) => boolean
}

export default class MasterGear implements GearBase {
  public readonly id = 0

  public readonly category = 0
  public readonly iconId = 0
  public readonly name = ""

  public readonly firepower = 0
  public readonly armor = 0
  public readonly torpedo = 0
  public readonly antiAir = 0
  public readonly bombing = 0
  public readonly asw = 0
  public readonly los = 0

  public readonly accuracy = 0
  public readonly evasion = 0
  public readonly antiBomber = 0
  public readonly interception = 0

  public readonly range = 0
  public readonly radius = 0
  public readonly cost = 0

  public readonly improvable = false

  public readonly hp = 0
  public readonly speed = 0
  public readonly luck = 0

  public readonly attrs: GearAttribute[]

  constructor(partial: Partial<GearData>) {
    Object.assign(this, partial)
    this.attrs = createGearAttrs(this)
  }

  get gearId() {
    return this.id
  }

  get specialCategory() {
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
