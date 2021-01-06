import {
  MasterDataGear,
  MasterDataGearCategory,
  MasterDataAttrRule,
  IBonusType,
  isNonNullable,
  MasterDataIBonuses,
} from "@fleethub/utils/src"
import { GoogleSpreadsheetWorksheet, GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet"
import { Start2 } from "kc-tools"
import { deleteFalsyValues, updateRows } from "./utils"

const createGears = (rows: GoogleSpreadsheetRow[], start2: Start2): MasterDataGear[] => {
  const gears = start2.api_mst_slotitem.map((mst) => {
    const row = rows.find((row) => Number(row.gear_id) === mst.api_id)

    const next: MasterDataGear = {
      gear_id: mst.api_id,
      types: mst.api_type,
      name: mst.api_name,
      max_hp: mst.api_taik,
      armor: mst.api_souk,
      firepower: mst.api_houg,
      torpedo: mst.api_raig,
      speed: mst.api_soku,
      bombing: mst.api_baku,
      anti_air: mst.api_tyku,
      asw: mst.api_tais,
      los: mst.api_saku,
      luck: mst.api_luck,
      accuracy: mst.api_houm,
      evasion: mst.api_houk,
      range: mst.api_leng,
      radius: mst.api_distance,
      cost: mst.api_cost,

      improvable: row?.improvable === "TRUE",
      special_type: Number(row?.special_type),
      adjusted_anti_air_resistance: Number(row?.adjusted_anti_air_resistance),
      fleet_anti_air_resistance: Number(row?.fleet_anti_air_resistance),
    }

    deleteFalsyValues(next)

    return next
  })

  return gears
}

const createGearCategories = (rows: GoogleSpreadsheetRow[], start2: Start2) =>
  start2.api_mst_slotitem_equiptype.map((mst) => ({
    id: mst.api_id,
    name: mst.api_name,
    key: rows.find((row) => Number(row.id) === mst.api_id)?.key || "",
  }))

const makeReplaceGearExpr = (
  gears: MasterDataGear[],
  gear_categories: MasterDataGearCategory[],
  gear_attrs: MasterDataAttrRule[]
) => {
  const replaceCategory = (str: string) => {
    return gear_categories.reduce(
      (current, category) => current.replace(`"${category.name}"`, category.id.toString()),
      str
    )
  }

  const replaceName = (str: string) =>
    gears.reduce((current, gear) => current.replace(`"${gear.name}"`, gear.gear_id.toString()), str)

  const replaceAttr = (str: string) =>
    gear_attrs.reduce((current, attr) => current.replace(RegExp(`\\b${attr.key}\\b`, "g"), attr.expr), str)

  return (str: string) =>
    replaceAttr(str)
      .replace(/category == "[^"]+"/g, replaceCategory)
      .replace(/category_in\(\s*("[^"]+",?\s*)+\)/gs, replaceCategory)
      .replace(/name == "[^"]+"/g, replaceName)
      .replace(/name_in\(\s*("[^"]+",?\s*)+\)/gs, replaceName)
      .replace(/\bname/g, "gear_id")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ")
}

const readGearAttrs = async (
  sheet: GoogleSpreadsheetWorksheet,
  gears: MasterDataGear[],
  gear_categories: MasterDataGearCategory[]
) => {
  const rows = await sheet.getRows()

  const gear_attrs: MasterDataAttrRule[] = []
  const replaceExpr = makeReplaceGearExpr(gears, gear_categories, gear_attrs)

  rows.forEach((row) => {
    const expr = replaceExpr(row.expr)
    gear_attrs.push({ key: row.key, name: row.name, expr })
  })

  return gear_attrs
}

const readIBonuses = async (
  doc: GoogleSpreadsheet,
  gears: MasterDataGear[],
  gear_categories: MasterDataGearCategory[],
  gear_attrs: MasterDataAttrRule[]
): Promise<MasterDataIBonuses> => {
  const sheets: Record<IBonusType, GoogleSpreadsheetWorksheet> = {
    shelling_power: doc.sheetsByTitle["改修砲撃攻撃力"],
    shelling_accuracy: doc.sheetsByTitle["改修砲撃命中"],
    torpedo_power: doc.sheetsByTitle["改修雷撃攻撃力"],
    torpedo_accuracy: doc.sheetsByTitle["改修雷撃命中"],
    torpedo_evasion: doc.sheetsByTitle["改修雷撃回避"],
    night_power: doc.sheetsByTitle["改修夜戦攻撃力"],
    night_accuracy: doc.sheetsByTitle["改修夜戦命中"],
    asw_power: doc.sheetsByTitle["改修対潜攻撃力"],
    asw_accuracy: doc.sheetsByTitle["改修対潜命中"],
    defense_power: doc.sheetsByTitle["改修防御力"],
    contact_selection: doc.sheetsByTitle["改修触接選択率"],
    fighter_power: doc.sheetsByTitle["改修制空"],
    adjusted_anti_air: doc.sheetsByTitle["改修加重対空"],
    fleet_anti_air: doc.sheetsByTitle["改修艦隊対空"],
    effective_los: doc.sheetsByTitle["改修マップ索敵"],
  }

  const replaceExpr = makeReplaceGearExpr(gears, gear_categories, gear_attrs)

  const promises = Object.entries(sheets).map(async ([key, sheet]) => {
    const rows = await sheet.getRows()
    const rules = rows
      .map(({ expr, formula }) => {
        if (!expr || !formula) return undefined
        return { expr: replaceExpr(expr), formula }
      })
      .filter(isNonNullable)

    return [key, rules]
  })

  const entries = await Promise.all(promises)
  return Object.fromEntries(entries) as MasterDataIBonuses
}

export const updateGearData = async (doc: GoogleSpreadsheet, start2: Start2) => {
  const sheets = {
    gears: doc.sheetsByTitle["装備"],
    gear_categories: doc.sheetsByTitle["装備カテゴリ"],
    gear_attrs: doc.sheetsByTitle["装備属性"],
  }

  const [gears, gear_categories] = await Promise.all([
    updateRows(sheets.gears, (rows) => createGears(rows, start2)),
    updateRows(sheets.gear_categories, (rows) => createGearCategories(rows, start2)),
  ])

  const gear_attrs = await readGearAttrs(sheets.gear_attrs, gears, gear_categories)
  const ibonuses = await readIBonuses(doc, gears, gear_categories, gear_attrs)

  const data = {
    gears,
    gear_categories,
    gear_attrs,
    ibonuses,
  }

  return data
}
