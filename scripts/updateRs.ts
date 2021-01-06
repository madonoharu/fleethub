import fs from "fs-extra"
import child_process from "child_process"
import { MasterData } from "@fleethub/utils/src"

import storage from "./data/storage"

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

const replaceEnum = (src: string, config: EnumConfig) => {
  const text = createEnum(config)

  const regex = RegExp(`enum ${config.name} \\{.*?\\}(?!;)`, "s")
  return src.replace(regex, text)
}

class Updater {
  constructor(private md: MasterData) {}

  private updateShipId = (src: string): string => {
    const inner = this.md.ships
      .filter((ship) => ship.ship_id < 1500)
      .map((ship) => `("${ship.name}") => { ${ship.ship_id} };`)
      .join("\n")

    const macroName = "const_ship_id"
    const macro = `macro_rules! ${macroName} { ${inner} }`

    const regex = RegExp(`macro_rules! ${macroName} .*?\\}(?!;)`, "s")

    return src.replace(regex, macro)
  }

  private updateGearId = (src: string): string => {
    const inner = this.md.gears
      .filter((gear) => gear.gear_id < 500)
      .map((gear) => `("${gear.name}") => { ${gear.gear_id} };`)
      .join("\n")

    const macroName = "const_gear_id"
    const macro = `macro_rules! ${macroName} { ${inner} }`

    const regex = RegExp(`macro_rules! ${macroName} .*?\\}(?!;)`, "s")

    return src.replace(regex, macro)
  }

  private updateGearCategory = (src: string): string =>
    replaceEnum(src, {
      name: "GearCategory",
      items: this.md.gear_categories,
      unknown: true,
    })

  private updateGearAttr = (src: string): string =>
    replaceEnum(src, {
      name: "GearAttr",
      items: this.md.gear_attrs,
    })

  private updateShipType = (src: string) =>
    replaceEnum(src, {
      name: "ShipType",
      items: this.md.ship_types,
      unknown: true,
    })

  private updateShipClass = (src: string) =>
    replaceEnum(src, {
      name: "ShipClass",
      items: this.md.ship_classes,
      unknown: true,
    })

  private updateShipAttr = (src: string) =>
    replaceEnum(src, {
      name: "ShipAttr",
      items: this.md.ship_attrs,
    })

  public update = (src: string): string =>
    [
      this.updateShipId,
      this.updateGearId,
      this.updateGearCategory,
      this.updateGearAttr,
      this.updateShipType,
      this.updateShipClass,
      this.updateShipAttr,
    ].reduce((current, fn) => fn(current), src)
}

const main = async () => {
  const path = "packages/sim/src/constants.rs"
  const src = fs.readFileSync(path).toString()

  const md = await storage.readMasterData()

  fs.outputFileSync(path, new Updater(md).update(src))
  child_process.execSync(`rustfmt ${path}`)
}

main()
