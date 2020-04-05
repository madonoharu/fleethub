import fs from "fs"
import signale from "signale"
import { chain } from "lodash"

import { Start2, isPlayerShip, MstShip } from "./start2"

export const abyssalNameToClass = (name: string) => name.replace(/後期型|-壊| バカンスmode|改/g, "")

const isAbyssalShip = (ship: MstShip) => !isPlayerShip(ship)

export const createLiteralType = (typeName: string, types: string[]) => {
  const inner = types.map((type) => `  | "${type}"`).join("\n")
  return `export type ${typeName} =\n${inner}\n`
}

export const createEnum = (enumName: string, data: Array<readonly [string, number]>, isConst = true) => {
  const names = data.map(([name]) => name)
  const duplicatedNames = names.filter((name) => names.indexOf(name) !== names.lastIndexOf(name))
  const inner = data
    .map(([name, value]) => {
      const key = duplicatedNames.includes(name) ? `${name} id${value}` : name
      const line = `  "${key}" = ${value}`
      return line
    })
    .join(",")

  return `export${isConst ? " const" : ""} enum ${enumName} {${inner}}`
}

export const createAbyssalShipClassJpMap = (start2: Start2) => {
  const classNames = chain(start2.api_mst_ship)
    .filter(isAbyssalShip)
    .map((ship) => abyssalNameToClass(ship.api_name))
    .uniq()
    .value()

  const irohaClasses: string[] = []
  const specialClasses: string[] = []

  classNames.forEach((name) => {
    if (name.includes("級")) {
      irohaClasses.push(name)
    } else {
      specialClasses.push(name)
    }
  })

  const irohaClassMap = irohaClasses.map((name, index) => [name, 1001 + index] as [string, number])
  const specialClassMap = specialClasses.map((name, index) => [name, 2001 + index] as [string, number])

  return irohaClassMap.concat(specialClassMap)
}

class TypeUpdater {
  constructor(private start2: Start2) {}

  get dataChain() {
    return chain(this.start2.api_mst_ship)
      .sortBy("api_sort_id")
      .map((ship) => {
        const { api_id, api_name: name, api_sort_id } = ship
        const rank = api_sort_id % 10
        const individual = (api_sort_id - rank) / 10
        return { shipId: api_id, name, rank, individual }
      })
  }

  public createShipId = () =>
    createEnum(
      "ShipId",
      this.start2.api_mst_ship.map(({ api_name, api_id }) => [api_name, api_id])
    )

  public createGearId = () =>
    createEnum(
      "GearId",
      this.start2.api_mst_slotitem.map(({ api_name, api_id }) => [api_name, api_id])
    )

  public createShipName = () => {
    const { dataChain } = this
    const playerShipNames = dataChain
      .uniqBy("name")
      .filter((ship) => ship.shipId <= 1500)
      .map(({ name }) => name)
      .value()

    const abyssalShipNames = dataChain
      .uniqBy("name")
      .filter((ship) => ship.shipId > 1500)
      .map(({ name }) => name)
      .value()

    const playerShipType = createLiteralType("PlayerShipName", playerShipNames)
    const abyssalShipType = createLiteralType("AbyssalShipName", abyssalShipNames)

    return `${playerShipType}\n${abyssalShipType}\nexport type ShipName = PlayerShipName | AbyssalShipName\n`
  }

  public createGearName = () => {
    const gearNames = this.start2.api_mst_slotitem.map(({ api_name }) => api_name)
    return createLiteralType("GearName", gearNames)
  }

  public createGearCategoryName = () => {
    const data = this.start2.api_mst_slotitem_equiptype.map(({ api_id, api_name }) => [api_name, api_id] as const)
    return createEnum("GearCategoryName", data, false)
  }

  public createAbyssalShipClassJp = () => {
    const data = createAbyssalShipClassJpMap(this.start2)
    return createEnum("AbyssalShipClassJp", data)
  }

  public createRemodelGroup = () => {
    const data = this.dataChain
      .filter((ship) => ship.shipId < 1500 && ship.rank === 1)
      .uniqBy("individual")
      .map((ship) => [ship.name, ship.shipId] as const)
      .value()

    return createEnum("RemodelGroup", data)
  }

  public write = () => {
    fs.writeFileSync("src/ShipName.ts", this.createShipName())
    fs.writeFileSync("src/GearName.ts", this.createGearName())

    fs.writeFileSync("src/ShipId.ts", this.createShipId())
    fs.writeFileSync("src/GearId.ts", this.createGearId())
    fs.writeFileSync("src/GearCategoryName.ts", this.createGearCategoryName())
    fs.writeFileSync("src/RemodelGroup.ts", this.createRemodelGroup())

    fs.writeFileSync("scripts/AbyssalShipClassJp.ts", this.createAbyssalShipClassJp())
  }
}

export const writeTypes = (start2: Start2) => {
  const updater = new TypeUpdater(start2)
  updater.write()

  signale.complete()
}
