import { mapValues, MasterData, GearCategory, GearAttribute, StatInterval } from "@fleethub/utils"
import { MasterGear } from "../gear"

function null2NaN(stat: StatInterval): [number, number]
function null2NaN(nums: (number | null)[]) {
  return nums.map((n) => (n === null ? NaN : n))
}

export default class MasterDataAdapter {
  public gears: MasterGear[]

  constructor(public masterData: MasterData) {
    this.gears = masterData.gears.map((gearData) => {
      const category = this.getGearCategory(gearData.types[2]) as GearCategory
      const attrs = this.getGearAttrs(gearData.id) as GearAttribute[]
      const improvementBonusFormulas = this.getImprovementBonusFormulas(gearData.id)

      return new MasterGear(gearData, { category, attrs, improvementBonusFormulas })
    })
  }

  private getGearCategory = (type2: number) => {
    const found = this.masterData.gearCategories.find((cat) => cat.id === type2)?.key
    return found || ""
  }

  private getGearAttrs = (gearId: number) => {
    return this.masterData.gearAttrs.filter((data) => data.ids.includes(gearId)).map((data) => data.key)
  }

  private getImprovementBonusFormulas = (gearId: number) =>
    mapValues(this.masterData.improvementBonuses, (rules) => {
      return rules.find((rule) => rule.ids.includes(gearId))?.formula
    })

  public getMasterGearAdditionalData = (gearId: number) => {
    const gear = this.masterData.gears.find((gear) => gear.id === gearId)
    if (!gear) return

    const category = this.getGearCategory(gear.types[2])
    const attrs = this.getGearAttrs(gear.id)
    const improvementBonusFormulas = this.getImprovementBonusFormulas(gear.id)

    return { category, attrs, improvementBonusFormulas }
  }
}
