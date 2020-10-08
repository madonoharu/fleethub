import { GoogleSpreadsheetWorksheet } from "google-spreadsheet"
import { MasterDataAttrRule } from "../types"

export default class MasterDataGearAttrsSheet {
  constructor(public sheet: GoogleSpreadsheetWorksheet) {}

  read = async (): Promise<MasterDataAttrRule[]> => {
    const rows = await this.sheet.getRows()
    return rows.map(({ name, key, expr }) => ({ name, key, expr }))
  }
}
