import { DeckGear } from "../utils"
import Proficiency from "./Proficiency"
import { GearBase } from "./MasterGear"
import { GearAttribute } from "./GearAttribute"

export type GearState = {
  gearId: number
  stars?: number
  exp?: number
}

export type Gear = Required<GearState> &
  Omit<GearBase, "id"> & {
    is: (attr: GearAttribute) => boolean
    state: GearState
    deck: DeckGear
  }

export class GearImpl implements Gear {
  constructor(public state: GearState, private base: GearBase) {}

  get gearId() {
    return this.state.gearId
  }
  get stars() {
    return this.state.stars ?? 0
  }
  get exp() {
    return this.state.exp ?? 0
  }

  get name() {
    return this.base.name
  }
  get category() {
    return this.base.category
  }
  get iconId() {
    return this.base.iconId
  }
  get attrs() {
    return this.base.attrs
  }
  get specialCategory() {
    return this.base.specialCategory
  }

  get categoryIn() {
    return this.base.categoryIn
  }

  get is() {
    return this.base.is
  }

  get in() {
    return this.base.in
  }

  get hp() {
    return this.base.hp
  }
  get firepower() {
    return this.base.firepower
  }
  get armor() {
    return this.base.armor
  }
  get torpedo() {
    return this.base.torpedo
  }
  get antiAir() {
    return this.base.antiAir
  }
  get speed() {
    return this.base.speed
  }
  get bombing() {
    return this.base.bombing
  }
  get asw() {
    return this.base.asw
  }
  get los() {
    return this.base.los
  }
  get luck() {
    return this.base.luck
  }
  get accuracy() {
    return this.base.accuracy
  }
  get evasion() {
    return this.base.evasion
  }
  get antiBomber() {
    return this.base.antiBomber
  }
  get interception() {
    return this.base.interception
  }
  get range() {
    return this.base.range
  }
  get radius() {
    return this.base.radius
  }
  get cost() {
    return this.base.cost
  }
  get improvable() {
    return this.base.improvable
  }

  get deck() {
    const mas = Proficiency.expToLevel(this.exp)
    return { id: this.gearId, mas, rf: this.stars }
  }
}
