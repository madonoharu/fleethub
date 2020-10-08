import { mapValues } from "@fleethub/utils"
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from "google-spreadsheet"
import { ImprovementBonusRule, ImprovementBonusRules } from "../types"

type Awaited<T> = T extends Promise<infer U> ? U : never

const promiseAllValues = async <T extends Record<string, Promise<unknown>>>(obj: T) => {
  const result: Record<string, unknown> = {}

  const promises = Object.entries(obj).map(async ([key, value]) => {
    result[key] = await value
  })

  await Promise.all(promises)

  return result as { [K in keyof T]: Awaited<T[K]> }
}

const fetchImprovementBonusRule = async (sheet: GoogleSpreadsheetWorksheet): Promise<ImprovementBonusRule[]> => {
  const rows = await sheet.getRows()

  return rows.map(({ expr, formula }) => ({ expr, formula }))
}

export default class ImprovementBonusRulesSheet {
  constructor(public doc: GoogleSpreadsheet) {}

  read = async () => {
    const { sheetsByTitle } = this.doc

    const sheets: Record<keyof ImprovementBonusRules, GoogleSpreadsheetWorksheet> = {
      shellingPower: sheetsByTitle["改修砲撃攻撃力"],
      shellingAccuracy: sheetsByTitle["改修砲撃命中"],
      torpedoPower: sheetsByTitle["改修雷撃攻撃力"],
      torpedoAccuracy: sheetsByTitle["改修雷撃命中"],
      torpedoEvasion: sheetsByTitle["改修雷撃回避"],
      nightPower: sheetsByTitle["改修夜戦攻撃力"],
      nightAccuracy: sheetsByTitle["改修夜戦命中"],
      aswPower: sheetsByTitle["改修対潜攻撃力"],
      aswAccuracy: sheetsByTitle["改修対潜命中"],
      defensePower: sheetsByTitle["改修防御力"],
      contactSelection: sheetsByTitle["改修触接選択率"],
      fighterPower: sheetsByTitle["改修制空"],
      adjustedAntiAir: sheetsByTitle["改修加重対空"],
      fleetAntiAir: sheetsByTitle["改修艦隊防空"],
      effectiveLos: sheetsByTitle["改修マップ索敵"],
    }

    const promises = mapValues(sheets, fetchImprovementBonusRule)
    return await promiseAllValues(promises)
  }
}
