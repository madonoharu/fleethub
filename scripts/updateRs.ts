import fs from "fs-extra"
import childProcess from "child_process"
import util from "util"
import { MasterData } from "@fleethub/utils/src"

import storage from "./update/storage"

const exec = util.promisify(childProcess.exec)

type EnumItem = string | [string, number | string, string?]

const createEnum = (enumName: string, items: EnumItem[]) => {
  const inner = items
    .map((item) => {
      if (Array.isArray(item)) {
        const [key, value, comment] = item
        const line = `${key} = ${typeof value === "number" ? value : `"${value}"`}`

        if (!comment) return line
        return `/** ${comment} */${line}`
      }

      return item
    })
    .join(",")

  return `pub enum ${enumName} {${inner}}\n`
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

  private updateGearCategory = (src: string): string => {
    const text = createEnum(
      "GearCategory",
      this.md.gear_categories.map((cat) => [cat.key, cat.id])
    )

    const regex = RegExp(`pub enum GearCategory \\{.*?\\}(?!;)`, "s")
    return src.replace(regex, text)
  }

  private updateGearAttr = (src: string): string => {
    const text = createEnum(
      "GearAttr",
      this.md.gear_attrs.map((attr) => attr.key)
    )

    const regex = RegExp(`pub enum GearAttr \\{.*?\\}(?!;)`, "s")
    return src.replace(regex, text)
  }

  public update = (src: string): string =>
    [this.updateShipId, this.updateGearId, this.updateGearCategory, this.updateGearAttr].reduce(
      (current, fn) => fn(current),
      src
    )
}

const main = async () => {
  const path = "packages/sim/src/constants.rs"
  const src = fs.readFileSync(path).toString()

  const md = await storage.readMasterData()

  fs.outputFileSync(path, new Updater(md).update(src))
  await exec(`rustfmt ${path}`)
}

main()
