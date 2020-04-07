import KcsimFactory from "./KcsimFactory"
import { GearCategory } from "@fleethub/data"

const allCategories = Object.values(GearCategory).filter((value): value is number => typeof value === "number")

export default class Kcsim {
  public categoryIconIdMap = new Map<GearCategory, number>()

  constructor(public factory: KcsimFactory) {
    allCategories.forEach((category) => {
      const iconId = factory.masterGears.find((gear) => gear.category === category)?.iconId
      iconId && this.categoryIconIdMap.set(category, iconId)
    })
  }

  public createGear = this.factory.createGear
  public createShip = this.factory.createShip
}
