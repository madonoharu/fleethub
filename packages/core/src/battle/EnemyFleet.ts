import { Fleet } from "../fleet"
import { FleetType, Formation, ShipRole } from "../common"
import { Ship } from "../ship"
import { EnemyFleetState } from "../plan"

import { BattleFleet, ShipContext } from "./BattleFleetImpl"

export default class EnemyFleet implements BattleFleet {
  public readonly side = "Enemy"

  public fleetType: FleetType

  constructor(public state: EnemyFleetState, public main: Fleet, public escort?: Fleet) {
    this.fleetType = escort ? "Combined" : "Single"
  }

  public getShipContext(ship: Ship): ShipContext | undefined {
    const { main, escort, side, fleetType, formation } = this

    const role: ShipRole = escort?.ships.includes(ship) ? "Escort" : "Main"
    const fleet = role === "Main" ? main : escort
    const isFlagship = fleet?.ships[0] === ship

    if (!fleet) return

    const index = fleet.entries.findIndex((entry) => entry[1] === ship)
    /** temp */
    const length = 6
    const position = index >= Math.floor(length / 2) ? "TopHalf" : "BottomHalf"

    return {
      side,
      role,
      isFlagship,
      position,
      formation,
      fleetType,
    }
  }

  get isCombined() {
    return this.fleetType === "Combined"
  }

  private get defaultFormation(): Formation {
    return this.isCombined ? "Cruising1" : "LineAhead"
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
