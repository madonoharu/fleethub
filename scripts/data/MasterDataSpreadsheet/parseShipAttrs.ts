import { cloneJson, MasterDataShip, MasterDataAttrRule } from "@fleethub/utils/src"

import { MasterDataAttrsSheetRow } from "./MasterDataAttrsSheet"
import parseExpr, { Variables } from "./parseExpr"

type MutableShip = Variables & MasterDataShip

export const omitEvaluate = <T extends { evaluate: unknown }>(arg: T): Omit<T, "evaluate"> => {
  const result = { ...arg }
  delete result.evaluate
  return result
}

const parseShipAttrs = (ships: MasterDataShip[], rows: MasterDataAttrsSheetRow[]): MasterDataAttrRule[] => {
  const attrs = rows.map((row) => ({
    key: row.key,
    name: row.name,
    evaluate: parseExpr(row.expr),
    ids: Array<number>(),
  }))

  const mutableShips = cloneJson(ships) as MutableShip[]

  mutableShips.forEach((ship) => {
    attrs.forEach((attr) => {
      const result = Boolean(attr.evaluate(ship))
      ship[attr.key] = result
      if (result) attr.ids.push(ship.id)
    })
  })

  return attrs.map(omitEvaluate)
}

export default parseShipAttrs
