import { GearData, GearCategory2, GearId, GearCategory, GearCategoryKey } from "@fleethub/data"

import { mapValues } from "../utils"

import { GearAttribute, createGearAttrs } from "./GearAttribute"
import { createImprovementData } from "./ImprovementData"
import { GearBase, ImprovementBonuses } from "./types"

export class MasterGear implements GearBase {
  public readonly id = this.data.id || 0
  public readonly category = this.data.category || 0
  public readonly iconId = this.data.iconId || 0
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

  public readonly attrs: GearAttribute[]

  constructor(private data: Partial<GearData>) {
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
        return GearCategory2.CbRecon2
    }

    return this.category
  }

  public is = (attr: GearAttribute) => this.attrs.includes(attr)

  public in = (...attrs: GearAttribute[]) => attrs.some(this.is)

  public categoryIs = (key: GearCategoryKey) => this.category === GearCategory[key]

  public categoryIn = (...keys: GearCategoryKey[]) => keys.some(this.categoryIs)

  get improvementData() {
    return createImprovementData(this)
  }

  public toImprovementBonuses = (stars: number): ImprovementBonuses => {
    return mapValues(this.improvementData, (formula) => {
      if (!formula) return 0
      const { multiplier, type } = formula
      if (type === "Linear") return multiplier * stars
      return multiplier * Math.sqrt(stars)
    })
  }
}
