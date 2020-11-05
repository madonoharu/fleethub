import { writeFile } from "fs-extra"
import childProcess from "child_process"
import util from "util"
import { MasterData, uniq } from "@fleethub/utils/src"

import storage from "./data/storage"

const exec = util.promisify(childProcess.exec)

const createLiteralType = (typeName: string, types: string[]) => {
  const inner = uniq(types)
    .map((type) => `"${type}"`)
    .join("|")
  return `export type ${typeName} = ${inner}\n`
}

const createEnum = (enumName: string, data: Array<readonly [string, number | string, string?]>, isConst = true) => {
  const names = data.map(([name]) => name)
  const duplicatedNames = names.filter((name) => names.indexOf(name) !== names.lastIndexOf(name))
  const inner = data
    .map(([name, value, comment]) => {
      const key = duplicatedNames.includes(name) ? `${name} id${value}` : name
      const line = `"${key}" = ${typeof value === "number" ? value : `"${value}"`}`

      if (!comment) return line
      return `/** ${comment} */${line}`
    })
    .join(",")

  return `export${isConst ? " const" : ""} enum ${enumName} {${inner}}\n`
}

type TypeCreator = (md: MasterData) => string

const creators: TypeCreator[] = [
  (md) =>
    createEnum(
      "ShipId",
      md.ships.map((ship) => [ship.name, ship.id])
    ),

  (md) =>
    createLiteralType(
      "ShipName",
      md.ships.map((ship) => ship.name)
    ),

  (md) =>
    createLiteralType(
      "ShipYomi",
      md.ships.map((ship) => ship.yomi)
    ),

  (md) =>
    createLiteralType(
      "ShipType",
      md.shipTypes.map((type) => type.key)
    ),

  (md) =>
    createLiteralType(
      "ShipClass",
      md.shipClasses.map((shipClass) => shipClass.key).filter((key) => key)
    ),

  (md) =>
    createLiteralType(
      "ShipAttribute",
      md.shipAttrs.map((attr) => attr.key)
    ),

  (md) =>
    createEnum(
      "GearId",
      md.gears.map((gear) => [gear.name, gear.id])
    ),

  (md) =>
    createLiteralType(
      "GearName",
      md.gears.map((gear) => gear.name)
    ),

  (md) =>
    createLiteralType(
      "GearCategory",
      md.gearCategories.map((cat) => cat.key)
    ),

  (md) =>
    createLiteralType(
      "GearAttribute",
      md.gearAttrs.map((attr) => attr.key)
    ),
]

const updateTypes = async () => {
  const md = await storage.read()

  const text = creators.map((fn) => fn(md)).join("\n")

  const path = "packages/utils/src/fhTypes.ts"

  await writeFile(path, text)
  await exec(`yarn prettier -w ${path}`)
}

updateTypes()
