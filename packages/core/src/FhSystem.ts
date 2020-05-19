import { GearCategory } from "@fleethub/data"

import Factory from "./Factory"

const allCategories = Object.values(GearCategory).filter((value): value is number => typeof value === "number")

export default class FhSystem {
  public categoryIconIdMap = new Map<GearCategory, number>()

  constructor(public factory: Factory) {
    allCategories.forEach((category) => {
      const iconId = factory.masterGears.find((gear) => gear.category === category)?.iconId
      iconId && this.categoryIconIdMap.set(category, iconId)
    })
  }

  public masterGears = this.factory.masterGears
  public masterShips = this.factory.masterShips

  public createGear = this.factory.createGear
  public createShip = this.factory.createShip
  public createFleet = this.factory.createFleet
  public createAirbase = this.factory.createAirbase
  public createPlan = this.factory.createPlan
}
