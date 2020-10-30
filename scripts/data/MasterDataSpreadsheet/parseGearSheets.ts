import { mapValues, MasterDataGear, MasterDataGearCategory } from "@fleethub/utils/src"

import { MasterDataAttrsSheetRow } from "./MasterDataAttrsSheet"
import { ImprovementBonusSheets, ImprovementBonusSheetRow } from "./ImprovementBonusSheets"
import parseExpr, { Variables } from "./parseExpr"
import { omitEvaluate } from "./parseShipAttrs"

export default (
  gears: MasterDataGear[],
  categories: MasterDataGearCategory[],
  attrsSheetRows: MasterDataAttrsSheetRow[],
  improvementBonusSheets: ImprovementBonusSheets
) => {
  const attrs = attrsSheetRows.map((row) => ({
    key: row.key,
    name: row.name,
    evaluate: parseExpr(row.expr),
    ids: Array<number>(),
  }))

  const getCategoryName = (categoryId: number) => {
    return categories.find((category) => category.id === categoryId)?.name || ""
  }

  type MutableGear = Variables & Required<MasterDataGear>

  const mutableGears: MutableGear[] = gears.map((gear) => ({
    maxHp: 0,
    firepower: 0,
    armor: 0,
    torpedo: 0,
    antiAir: 0,
    speed: 0,
    bombing: 0,
    asw: 0,
    los: 0,
    luck: 0,
    accuracy: 0,
    evasion: 0,
    antiBomber: 0,
    interception: 0,
    range: 0,
    radius: 0,
    cost: 0,
    improvable: false,
    categoryName: getCategoryName(gear.types[2]),
    ...gear,
  }))

  mutableGears.forEach((gear) => {
    attrs.forEach((attr) => {
      const result = Boolean(attr.evaluate(gear))
      gear[attr.key] = result
      if (result) attr.ids.push(gear.id)
    })
  })

  const parseImprovementBonusSheet = (rows: ImprovementBonusSheetRow[]) => {
    const rules = rows.map((row) => ({
      formula: row.formula,
      evaluate: parseExpr(row.expr),
      ids: Array<number>(),
    }))

    mutableGears.forEach((gear) => {
      for (const rule of rules) {
        if (!rule.evaluate(gear)) continue
        rule.ids.push(gear.id)
      }
    })

    return rules.map(omitEvaluate)
  }

  const improvementBonuses = mapValues(improvementBonusSheets, parseImprovementBonusSheet)

  return { gearAttrs: attrs.map(omitEvaluate), improvementBonuses }
}
