import { GoogleSpreadsheetWorksheet } from "google-spreadsheet"

import writeRows from "./writeRows"

type EnumData = { id: number; name: string; key: string }[]

export default class EnumSheet {
  constructor(public sheet: GoogleSpreadsheetWorksheet) {}

  read = async (): Promise<EnumData> => {
    const rows = await this.sheet.getRows()
    return rows.map((row) => ({
      id: Number(row.id),
      name: row.name || "",
      key: row.key || "",
    }))
  }

  write = async (data: EnumData) => {
    writeRows(this.sheet, data)
  }
}