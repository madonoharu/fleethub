import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from "google-spreadsheet"
import { MasterDataGear, SheetRow } from "@fleethub/utils/src"

import toHeaderKeyValues from "./toHeaderKeyValues"
import writeRows from "./writeRows"

const getDefaultMasterDataGear = (): MasterDataGear => ({
  id: 0,
  category: 0,
  iconId: 0,
  name: "",
})

export default class MasterDataGearsSheet {
  static from = (doc: GoogleSpreadsheet) => new MasterDataGearsSheet(doc.sheetsByTitle["装備データ"])

  constructor(public sheet: GoogleSpreadsheetWorksheet) {}

  fetchHeaderKeyValues = async () => {
    const { sheet } = this
    await sheet.loadHeaderRow()
    return toHeaderKeyValues<keyof MasterDataGear>(sheet.headerValues)
  }

  read = async () => {
    const rows = await this.sheet.getRows()
    const headerKeyValues = await this.fetchHeaderKeyValues()

    const rowToGear = (row: SheetRow) => {
      const gear = getDefaultMasterDataGear()

      headerKeyValues.forEach(({ headerValue, key }) => {
        const value = row[headerValue]

        if (!value) return

        if (key === "name") {
          gear[key] = String(value)
        } else if (key === "improvable") {
          gear[key] = value === "TRUE" ? true : undefined
        } else {
          gear[key] = Number(value)
        }
      })

      return gear
    }

    return rows.map(rowToGear)
  }

  write = async (gears: MasterDataGear[]) => {
    const headerKeyValues = await this.fetchHeaderKeyValues()

    const rows = gears.map((gear) => {
      const row: SheetRow = {}

      headerKeyValues.map(({ headerValue, key }) => {
        if (key === "improvable") {
          row[headerValue] = Boolean(gear[key])
        } else {
          row[headerValue] = gear[key]
        }
      })

      return row
    })

    return writeRows(this.sheet, rows)
  }
}
