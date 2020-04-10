import { ShipData } from "../src"

export const setConvertible = (ships: ShipData[]) => {
  const findNextShip = ({ nextId }: ShipData) => {
    if (!nextId) return
    return ships.find((ship) => ship.id === nextId)
  }

  const findNextShips = (current: ShipData, depth = 0): ShipData[] => {
    if (depth > 5) return []
    const next = findNextShip(current)
    if (!next) return []
    return [next, ...findNextShips(next, depth + 1)]
  }

  const isConvertible = (ship: ShipData) => findNextShips(ship).includes(ship)

  ships.forEach((ship) => {
    if (isConvertible(ship)) {
      ship.convertible = true
    } else {
      ship.convertible = undefined
    }
  })
}
