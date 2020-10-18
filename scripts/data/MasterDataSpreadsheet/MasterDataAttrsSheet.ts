import { isNonNullable } from "@fleethub/utils/src"
import { GoogleSpreadsheetWorksheet } from "google-spreadsheet"

export type MasterDataAttrsSheetRow = { name: string; key: string; expr: string }

export default class MasterDataGearAttrsSheet {
  constructor(public sheet: GoogleSpreadsheetWorksheet) {}

  public read = async (): Promise<MasterDataAttrsSheetRow[]> => {
    const rows = await this.sheet.getRows()
    return rows
      .map(({ name, key, expr }) => {
        if (!key || !expr) return undefined
        return { name, key, expr }
      })
      .filter(isNonNullable)
  }
}
