import { MasterDataGear, SheetRow } from "../types"
import { keyJpMap } from "./MasterDataShipRecord"

const getDefaultMasterDataGear = (): MasterDataGear => ({
  id: 0,
  category: 0,
  iconId: 0,
  name: "",
})

const gearKeys = [
  "id",
  "name",
  "category",
  "iconId",
  "maxHp",
  "firepower",
  "torpedo",
  "bombing",
  "antiAir",
  "armor",
  "asw",
  "accuracy",
  "evasion",
  "interception",
  "antiBomber",
  "speed",
  "luck",
  "range",
  "radius",
  "cost",
  "improvable",
] as const

export default class MasterDataGearRecord {
  static headerValues = gearKeys.map((key) => keyJpMap[key])

  static rowToGear = (row: SheetRow) => new MasterDataGearRecord().setRow(row).gear
  static gearToRow = (gear: MasterDataGear) => new MasterDataGearRecord(gear).toRow()

  constructor(public gear = getDefaultMasterDataGear()) {}

  setRow = (row: SheetRow) => {
    const { gear } = this

    gearKeys.forEach((key) => {
      const value = row[keyJpMap[key]]
      if (!value) return

      if (key === "name") {
        gear[key] = String(value)
        return
      }

      if (key === "improvable") {
        if (value === "TRUE") {
          gear[key] = true
        }

        return
      }

      gear[key] = Number(value)
    })

    return this
  }

  toRow = () => {
    const { gear } = this
    const row: SheetRow = {}

    gearKeys.forEach((key) => {
      const value = gear[key]
      if (!value) return

      row[keyJpMap[key]] = value
    })

    row[keyJpMap["improvable"]] = Boolean(gear.improvable)

    return row
  }
}
