import { Ship } from "../ship"
import { sumBy } from "lodash-es"

const calcFleetLosModifier = (ships: Ship[]) => {
  const base = sumBy(ships, (ship) => ship.fleetLosFactor)
  return Math.floor(Math.sqrt(base) + 0.1 * base)
}
