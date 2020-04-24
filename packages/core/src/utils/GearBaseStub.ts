import { GearBase, GearAttribute } from "../gear"
import { GearCategoryKey, GearCategory } from "@fleethub/data"

export class GearBaseStub implements GearBase {
  public static from = (src: Partial<GearBase>) => Object.assign(new GearBaseStub(), src)
  public static fromAttrs = (...attrs: GearAttribute[]) => GearBaseStub.from({ attrs })
  public static fromCategory = (key: GearCategoryKey) => GearBaseStub.from({ category: GearCategory[key] })

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

  public is = (attr: GearAttribute) => this.attrs.includes(attr)

  public in = (...attrs: GearAttribute[]) => attrs.some(this.is)

  public categoryIs = (key: GearCategoryKey) => this.category === GearCategory[key]

  public categoryIn = (...keys: GearCategoryKey[]) => keys.some(this.categoryIs)
}
