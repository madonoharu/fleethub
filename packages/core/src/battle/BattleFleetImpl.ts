import { FleetType, Formation, ShipPosition, ShipRole, Side } from "../common"
import { Fleet } from "../fleet"
import { Plan } from "../plan"
import { Ship } from "../ship"

type BattleFleetParams = {
  main: Fleet
  escort?: Fleet
  fleetType: FleetType
  side: Side
  formation: Formation
}

export type ShipContext = {
  side: Side
  fleetType: FleetType
  role: ShipRole
  isFlagship: boolean
  position: ShipPosition
  formation: Formation
}

export type BattleFleet = {
  side: Side
  fleetType: FleetType
  formation: Formation
  main: Fleet
  escort?: Fleet
  isCombined: boolean

  getShipContext: (ship: Ship) => ShipContext | undefined

  calcFleetLosModifier: () => number
  calcFighterPower: (antiLb?: boolean) => number
}

export default class BattleFleetImpl implements BattleFleet {
  public static fromPlan = (plan: Plan, formation: Formation, side: Side) => {
    const { main, escort, fleetType } = plan
    return new BattleFleetImpl({ main, escort, fleetType, side, formation })
  }

  public side: Side
  public fleetType: FleetType
  public formation: Formation
  public main: Fleet
  public escort?: Fleet
  public ships: Ship[]

  constructor({ main, escort, fleetType, side, formation }: BattleFleetParams) {
    this.side = side
    this.fleetType = fleetType
    this.formation = formation

    this.main = main
    this.escort = escort

    this.ships = escort ? main.ships.concat(escort.ships) : main.ships
  }

  get isCombined() {
    return this.fleetType !== "Single"
  }

  public getShipContext = (ship: Ship): ShipContext | undefined => {
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

  public calcFleetLosModifier = (): number => {
    const { main, escort } = this

    return main.fleetLosModifier + (escort?.fleetLosModifier || 0)
  }

  public calcFighterPower = (antiLb?: boolean) => {
    const mainFp = this.main.calcFighterPower(antiLb)
    const escortFp = this.escort?.calcFighterPower(antiLb) || 0
    return mainFp + escortFp
  }
}
