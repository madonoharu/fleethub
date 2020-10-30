import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from "google-spreadsheet"
import { MasterDataGear, SheetRow } from "@fleethub/utils/src"
import { get, set } from "lodash"

import toHeaderKeyValues from "./toHeaderKeyValues"
import writeRows from "./writeRows"

const getDefaultMasterDataGear = (): MasterDataGear => ({
  id: 0,
  types: [0, 0, 0, 0, 0],
  name: "",
})

export default class MasterDataGearsSheet {
  static from = (doc: GoogleSpreadsheet) => new MasterDataGearsSheet(doc.sheetsByTitle["装備データ"])

  constructor(public sheet: GoogleSpreadsheetWorksheet) {}

  fetchHeaderKeyValues = async () => {
    const { sheet } = this
    await sheet.loadHeaderRow()
    return toHeaderKeyValues(sheet.headerValues)
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
          set(gear, key, String(value))
        } else if (key === "improvable") {
          set(gear, key, value === "TRUE" ? true : undefined)
        } else {
          set(gear, key, Number(value))
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
          row[headerValue] = Boolean(get(gear, key))
        } else {
          row[headerValue] = get(gear, key)
        }
      })

      return row
    })

    return writeRows(this.sheet, rows)
  }
}
