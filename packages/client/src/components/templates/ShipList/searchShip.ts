import { Ship } from "@fleethub/sim"

const searchById = (ships: Ship[], searchValue: string) => {
  const str = /^id(\d+)/.exec(searchValue)?.[1]
  if (!str) return

  const id = Number(str)
  return ships.find((ship) => ship.ship_id === id)
}

const searchShip = (ships: Ship[], searchValue: string) => {
  const idFound = searchById(ships, searchValue)
  if (idFound) {
    return [idFound]
  }

  return ships.filter(
    (ship) => ship.name.toUpperCase().includes(searchValue.toUpperCase()) || ship.yomi.includes(searchValue)
  )
}

export default searchShip
