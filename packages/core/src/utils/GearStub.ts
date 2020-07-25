import { Gear, GearBase, GearAttribute } from "../gear"
import { GearCategoryKey, GearCategory, GearCategoryName } from "@fleethub/data"

export class GearBaseStub implements GearBase {
  public static from = (src: Partial<GearBase>) => Object.assign(new GearBaseStub(), src)
  public static fromAttrs = (...attrs: GearAttribute[]) => GearBaseStub.from({ attrs })
  public static fromCategory = (key: GearCategoryKey) => GearBaseStub.from({ category: GearCategory[key] })
  public static fromCategoryName = (name: keyof typeof GearCategoryName) =>
    GearBaseStub.from({ category: GearCategoryName[name] })

  public gearId = 0
  public category = 0
  public iconId = 0
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

  public is = (attr: GearAttribute) => this.attrs.includes(attr)

  public in = (...attrs: GearAttribute[]) => attrs.some(this.is)

  public categoryIs = (key: GearCategoryKey) => this.category === GearCategory[key]

  public categoryIn = (...keys: GearCategoryKey[]) => keys.some(this.categoryIs)
}

export class GearStub extends GearBaseStub implements Gear {
  public static from = (src: Partial<Gear>) => Object.assign(new GearStub(), src)
  public static fromAttrs = (...attrs: GearAttribute[]) => GearBaseStub.from({ attrs })

  public state = {} as any

  public stars = NaN
  public exp = NaN
  public ace = NaN
  public hasProficiency = false
  public improvement = {} as Gear["improvement"]
  public calcFighterPower = jest.fn()
  public calcInterceptionPower = jest.fn()
  public calcContactTriggerFactor = jest.fn()
  public calcContactSelectionChance = jest.fn()
  adjustedAntiAir = NaN
  fleetAntiAir = NaN
}
