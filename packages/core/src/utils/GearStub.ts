import { GearCategory, GearAttribute } from "@fleethub/utils"
import masterData from "@fleethub/utils/MasterData"

import { Gear } from "../gear"

export class GearStub implements Gear {
  public static from = (src: Partial<Gear>) => Object.assign(new GearStub(), src)
  public static fromCategory = (category: GearCategory): GearStub => GearStub.fromCategory(category)
  public static fromAttrs = (...attrs: GearAttribute[]) => GearStub.from({ attrs })

  public category = "" as Gear["category"]
  public categoryName = ""
  public getImprovementBonuses = jest.fn()
  public improvementBonusFormulas = {}

  public gearId = 0
  public types = [0, 0, 0, 0, 0] as Gear["types"]
  public isAbyssal = false
  public specialType2 = 0
  public name = ""
  public firepower = 0
  public torpedo = 0
  public antiAir = 0
  public bombing = 0
  public asw = 0
  public accuracy = 0
  public evasion = 0
  public antiBomber = 0
  public interception = 0
  public los = 0
  public armor = 0
  public range = 0
  public radius = 0
  public cost = 0
  public improvable = false
  public maxHp = 0
  public speed = 0
  public luck = 0
  public attrs: GearAttribute[] = []
  public specialCategory = 0
  public hasProficiency = false

  public state = {} as any
  public stars = NaN
  public exp = NaN
  public ace = NaN
  public improvementBonuses = {} as Gear["improvementBonuses"]
  public calcFighterPower = jest.fn()
  public calcInterceptionPower = jest.fn()
  public calcContactTriggerFactor = jest.fn()
  public calcContactSelectionChance = jest.fn()
  adjustedAntiAir = NaN
  fleetAntiAir = NaN

  get categoryId() {
    return this.types[2]
  }

  get iconId() {
    return this.types[3]
  }

  public is = (attr: GearAttribute) => this.attrs.includes(attr)

  public in = (...attrs: GearAttribute[]) => attrs.some(this.is)

  public categoryIs = (category: GearCategory) => masterData.gearCategories.some((datum) => datum.key === category)

  public categoryIn = (...categories: GearCategory[]) => categories.some(this.categoryIs)
}
