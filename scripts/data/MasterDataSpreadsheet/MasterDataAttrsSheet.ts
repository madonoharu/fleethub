import { isNonNullable } from "@fleethub/utils/src"
import { GoogleSpreadsheetWorksheet } from "google-spreadsheet"

import { MasterDataAttrRule } from "../types"

export default class MasterDataGearAttrsSheet {
  constructor(public sheet: GoogleSpreadsheetWorksheet) {}

  read = async (): Promise<MasterDataAttrRule[]> => {
    const rows = await this.sheet.getRows()
    return rows
      .map(({ name, key, expr }) => {
        if (!key || !expr) return undefined
        return { name, key, expr }
      })
      .filter(isNonNullable)
  }
}
