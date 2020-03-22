import { DeckGear } from "../utils"
import Proficiency from "./Proficiency"
import { GearBase } from "./MasterGear"

export type GearState = {
  gearId: number
  star: number
  exp: number
}

export type Gear = GearState & {
  state: GearState
  deck: DeckGear
}

export default class GearImpl implements Gear {
  constructor(public state: GearState, private base: GearBase) {}

  get gearId() {
    return this.state.gearId
  }
  get star() {
    return this.state.star
  }
  get exp() {
    return this.state.exp
  }
  set exp(value: number) {
    this.state.exp = value
  }

  get categoryIn() {
    return this.base.categoryIn
  }

  get in() {
    return this.base.in
  }

  get deck() {
    const mas = Proficiency.expToLevel(this.exp)
    return { id: this.gearId, mas, rf: this.star }
  }
}
