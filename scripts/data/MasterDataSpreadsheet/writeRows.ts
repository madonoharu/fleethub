import { GoogleSpreadsheetWorksheet, GoogleSpreadsheetCell } from "google-spreadsheet"
import { SheetRow } from "@fleethub/utils/src"

const isEqualCellValue = (cell: GoogleSpreadsheetCell, next: string | number | boolean) => {
  const current = cell.value

  if (cell.valueType === "boolValue") {
    return current === Boolean(next)
  }

  return (current ?? "") === next
}

const writeRows = async (sheet: GoogleSpreadsheetWorksheet, rows: SheetRow[]) => {
  const rowCount = rows.length + 1
  if (sheet.gridProperties.rowCount !== rowCount) {
    await sheet.resize({ ...sheet.gridProperties, rowCount })
  }
  await sheet.loadCells("")

  rows.forEach((row, i) => {
    const rowIndex = i + 1
    sheet.headerValues.forEach((key, columnIndex) => {
      const cell = sheet.getCell(rowIndex, columnIndex)
      const next = row[key] ?? ""

      if (isEqualCellValue(cell, next)) return
      cell.value = next
    })
  })

  await sheet.saveUpdatedCells()
}

export default writeRows
