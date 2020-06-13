import { FleetState, Fleet } from "../fleet"
import { Formation } from "../common"

export type EnemyFleetState = {
  main: FleetState
  escort?: FleetState
  formation?: Formation
}

export type EnemyFleet = {
  formation: Formation
  main: Fleet
  escort?: Fleet

  fighterPower: number
  antiLbFighterPower: number
}

export class EnemyFleetImpl implements EnemyFleet {
  constructor(public state: EnemyFleetState, public main: Fleet, public escort: Fleet) {}

  get isCombinedFleet() {
    return Boolean(this.escort.ships.length > 0)
  }

  private get defaultFormation(): Formation {
    return this.isCombinedFleet ? "CruisingFormation1" : "LineAhead"
  }

  get formation() {
    return this.state.formation || this.defaultFormation
  }

  get fighterPower() {
    const mainFp = this.main.calcFighterPower()
    const escortFp = this.escort?.calcFighterPower() || 0
    return mainFp + escortFp
  }

  get antiLbFighterPower() {
    const mainFp = this.main.calcFighterPower(true)
    const escortFp = this.escort?.calcFighterPower(true) || 0
    return mainFp + escortFp
  }
}
