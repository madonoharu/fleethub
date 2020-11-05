import { ShipBase } from "@fleethub/core"

const searchById = (ships: ShipBase[], searchValue: string) => {
  const str = /^id(\d+)/.exec(searchValue)?.[1]
  if (!str) return

  const id = Number(str)
  return ships.find((ship) => ship.shipId === id)
}

const searchShip = (ships: ShipBase[], searchValue: string) => {
  const idFound = searchById(ships, searchValue)
  if (idFound) {
    return [idFound]
  }

  return ships.filter(
    (ship) => ship.name.toUpperCase().includes(searchValue.toUpperCase()) || ship.yomi.includes(searchValue)
  )
}

export default searchShip
