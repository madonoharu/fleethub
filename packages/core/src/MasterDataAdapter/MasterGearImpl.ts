import {
  mapValues,
  MasterDataGear,
  GearId,
  GearCategory,
  GearAttribute,
  ImprovementBonusType,
  Dict,
} from "@fleethub/utils"
import { GearCategory2 } from "@fleethub/data"
import { Parser } from "expr-eval"

export type ImprovementBonusFormulas = Dict<ImprovementBonusType, string>
export type ImprovementBonuses = Record<ImprovementBonusType, number>

type MasterGearAdditionalData = {
  category: GearCategory
  categoryName: string
  attrs: GearAttribute[]
  improvementBonusFormulas: ImprovementBonusFormulas
}

export interface MasterGear extends Omit<Required<MasterDataGear>, "id">, MasterGearAdditionalData {
  gearId: number

  categoryId: number
  iconId: number
  specialType2: number
  attrs: GearAttribute[]

  is: (attr: GearAttribute) => boolean
  in: (...attrs: GearAttribute[]) => boolean
  categoryIs: (category: GearCategory) => boolean
  categoryIn: (...categories: GearCategory[]) => boolean
  getImprovementBonuses: (stars: number) => ImprovementBonuses

  isAbyssal: boolean
  hasProficiency: boolean
}

export default class MasterGearImpl implements MasterGear {
  public readonly id = this.data.id || 0
  public readonly types = this.data.types || [0, 0, 0, 0, 0]
  public readonly name = this.data.name || ""

  public readonly firepower = this.data.firepower || 0
  public readonly torpedo = this.data.torpedo || 0
  public readonly antiAir = this.data.antiAir || 0
  public readonly bombing = this.data.bombing || 0
  public readonly asw = this.data.asw || 0
  public readonly accuracy = this.data.accuracy || 0
  public readonly evasion = this.data.evasion || 0
  public readonly antiBomber = this.data.antiBomber || 0
  public readonly interception = this.data.interception || 0
  public readonly los = this.data.los || 0
  public readonly armor = this.data.armor || 0
  public readonly range = this.data.range || 0
  public readonly radius = this.data.radius || 0
  public readonly cost = this.data.cost || 0
  public readonly improvable = this.data.improvable || false

  public readonly maxHp = this.data.maxHp || 0
  public readonly speed = this.data.speed || 0
  public readonly luck = this.data.luck || 0

  public readonly category = this.additionalData.category
  public readonly attrs = this.additionalData.attrs
  public readonly improvementBonusFormulas = this.additionalData.improvementBonusFormulas

  public readonly isAbyssal = this.id > 500

  public readonly categoryName = this.additionalData.categoryName

  constructor(private data: Partial<MasterDataGear>, private additionalData: MasterGearAdditionalData) {}

  get gearId() {
    return this.id
  }

  get categoryId() {
    return this.types[2]
  }

  get iconId() {
    return this.types[3]
  }

  get specialType2() {
    switch (this.id) {
      case GearId["試製51cm連装砲"]:
      case GearId["51cm連装砲"]:
        return GearCategory2.LargeCaliberMainGun2
      case GearId["15m二重測距儀+21号電探改二"]:
        return GearCategory2.LargeRadar2
      case GearId["試製景雲(艦偵型)"]:
        return GearCategory2.CbRecon2
    }

    return this.types[2]
  }

  public is: MasterGear["is"] = (attr) => this.attrs.includes(attr)

  public in: MasterGear["in"] = (...attrs) => attrs.some(this.is)

  public categoryIs = (category: GearCategory) => this.category === category

  public categoryIn = (...categories: GearCategory[]) => categories.some(this.categoryIs)

  public getImprovementBonuses = (stars: number): ImprovementBonuses =>
    mapValues(this.improvementBonusFormulas, (formula) => {
      if (!formula) return 0
      return Parser.evaluate(formula, { x: stars })
    })

  get hasProficiency() {
    return this.in("Seaplane", "CbAircraft", "LbAircraft", "JetAircraft")
  }
}
