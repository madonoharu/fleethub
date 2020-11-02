import { mapValues, MasterDataGear, GearId, GearCategory, GearAttribute } from "@fleethub/utils"
import { GearCategory2 } from "@fleethub/data"
import { Parser } from "expr-eval"

import { GearBase, ImprovementBonuses, ImprovementBonusFormulas } from "./types"

type MasterGearAdditionalData = {
  category: GearCategory
  attrs: GearAttribute[]
  improvementBonusFormulas: ImprovementBonusFormulas
}

export class MasterGear implements GearBase {
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

  public is: GearBase["is"] = (attr) => this.attrs.includes(attr)

  public in: GearBase["in"] = (...attrs) => attrs.some(this.is)

  public categoryIs = (category: GearCategory) => this.category === category

  public categoryIn = (...categories: GearCategory[]) => categories.some(this.categoryIs)

  public getImprovementBonuses = (stars: number) =>
    mapValues(this.improvementBonusFormulas, (formula) => {
      if (!formula) return 0
      return Parser.evaluate(formula as string, { x: stars })
    })

  get hasProficiency() {
    return this.in("Seaplane", "CbAircraft", "LbAircraft", "JetAircraft")
  }
}
