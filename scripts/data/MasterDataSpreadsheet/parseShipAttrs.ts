import { MasterDataShip } from "@fleethub/utils/src"

import { MasterDataAttrsSheetRow } from "./MasterDataAttrsSheet"
import parseExpr, { Variables } from "./parseExpr"

type MutableShip = Variables & MasterDataShip

const parseShipAttrs = (ships: MasterDataShip[], rows: MasterDataAttrsSheetRow[]) => {
  const attrs = rows.map((row) => ({
    key: row.key,
    name: row.name,
    evaluate: parseExpr(row.expr),
    ids: Array<number>(),
  }))

  const mutableShips = ships.concat() as MutableShip[]

  mutableShips.forEach((ship) => {
    attrs.forEach((attr) => {
      const result = Boolean(attr.evaluate(ship))
      ship[attr.key] = result
      if (result) attr.ids.push(ship.id)
    })
  })

  return attrs
}

export default parseShipAttrs
