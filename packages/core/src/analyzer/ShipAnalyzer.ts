import { Ship } from "../ship"
import { ShipKey, ShipRole } from "../common"

type FleetContext = {
  fleetLosModifier: number
}

type ShipAnalyzerParams = {
  ship: Ship
  key: ShipKey
  role: ShipRole
}

class ShipAnalyzer {
  private ship: Ship
  private key: ShipKey
  private role: ShipRole

  constructor({ ship, key, role }: ShipAnalyzerParams) {
    this.ship = ship
    this.role = role
    this.key = key
  }
}
