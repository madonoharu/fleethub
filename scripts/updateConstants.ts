import fs from "fs-extra"
import child_process from "child_process"
import { promisify } from "util"
import { MasterData } from "@fleethub/utils/src"

import storage from "./data/storage"

const exec = promisify(child_process.exec)

type EnumItem = {
  key: string
  id?: number
}

type EnumConfig = {
  name: string
  items: EnumItem[]
  unknown?: boolean
}

const createEnum = ({ name, items, unknown }: EnumConfig) => {
  const lines = items.map(({ id, key }) => (id === undefined ? key : `${key} = ${id}`))

  if (unknown) {
    lines.unshift("Unknown = 0")
  }

  return `enum ${name} {${lines.join(",")}}\n`
}

const replaceEnum = (config: EnumConfig) => (src: string) => {
  const text = createEnum(config)

  const regex = RegExp(`enum ${config.name} \\{.*?\\}(?!;)`, "s")
  return src.replace(regex, text)
}

const RS_PATH = "packages/sim/src/constants.rs"
const TS_PATH = "packages/utils/src/constants.ts"

const updateFile = async (path: string, updater: (src: string) => string) => {
  const src = (await fs.readFile(path)).toString()
  await fs.outputFile(path, updater(src))
}

const updateRs = async (md: MasterData) => {
  const updateShipId = (src: string): string => {
    const inner = md.ships
      .filter((ship) => ship.ship_id < 1500)
      .map((ship) => `("${ship.name}") => { ${ship.ship_id} };`)
      .join("\n")

    const macroName = "const_ship_id"
    const macro = `macro_rules! ${macroName} { ${inner} }`

    const regex = RegExp(`macro_rules! ${macroName} .*?\\}(?!;)`, "s")

    return src.replace(regex, macro)
  }

  const updateGearId = (src: string): string => {
    const inner = md.gears
      .filter((gear) => gear.gear_id < 500)
      .map((gear) => `("${gear.name}") => { ${gear.gear_id} };`)
      .join("\n")

    const macroName = "const_gear_id"
    const macro = `macro_rules! ${macroName} { ${inner} }`

    const regex = RegExp(`macro_rules! ${macroName} .*?\\}(?!;)`, "s")

    return src.replace(regex, macro)
  }

  await updateFile(RS_PATH, (src) =>
    [
      updateShipId,
      updateGearId,
      replaceEnum({
        name: "GearCategory",
        items: md.gear_categories,
        unknown: true,
      }),
      replaceEnum({
        name: "GearAttr",
        items: md.gear_attrs,
      }),
      replaceEnum({
        name: "ShipType",
        items: md.ship_types,
        unknown: true,
      }),
      replaceEnum({
        name: "ShipClass",
        items: md.ship_classes,
        unknown: true,
      }),
      replaceEnum({
        name: "ShipAttr",
        items: md.ship_attrs,
      }),
    ].reduce((current, fn) => fn(current), src)
  )

  await exec(`rustfmt ${RS_PATH}`)
}

const updateTs = async (md: MasterData) => {
  await updateFile(TS_PATH, (src) =>
    [
      replaceEnum({
        name: "GearCategory",
        items: md.gear_categories,
        unknown: true,
      }),
      replaceEnum({
        name: "GearAttr",
        items: md.gear_attrs,
      }),
      replaceEnum({
        name: "ShipType",
        items: md.ship_types,
        unknown: true,
      }),
      replaceEnum({
        name: "ShipClass",
        items: md.ship_classes,
        unknown: true,
      }),
      replaceEnum({
        name: "ShipAttr",
        items: md.ship_attrs,
      }),
    ].reduce((current, fn) => fn(current), src)
  )

  await exec(`prettier --write ${TS_PATH}`)
}

const main = async () => {
  const md = await storage.readMasterData()
  await Promise.all([updateRs(md), updateTs(md)])
}

main()
