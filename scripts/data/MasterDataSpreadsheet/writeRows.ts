import { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from "google-spreadsheet"

import { SheetRow } from "../types"

const writeRows = async (sheet: GoogleSpreadsheetWorksheet, rows: SheetRow[]) => {
  await sheet.loadHeaderRow()

  const { headerValues, gridProperties } = sheet

  await sheet.clear()
  await sheet.resize({ ...gridProperties, rowCount: rows.length + 1 })
  await sheet.setHeaderRow(headerValues)
  await sheet.addRows(rows as GoogleSpreadsheetRow[])
}

export default writeRows
