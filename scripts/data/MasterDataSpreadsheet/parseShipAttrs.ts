import { MasterDataShip, MasterDataAttrRule, MasterDataShipClass } from "@fleethub/utils/src"

import { MasterDataAttrsSheetRow } from "./MasterDataAttrsSheet"
import parseExpr, { Variables } from "./parseExpr"

type MutableShip = Variables & Required<MasterDataShip>

export const omitEvaluate = <T extends { evaluate: unknown }>(arg: T): Omit<T, "evaluate"> => {
  const result = { ...arg }
  delete result.evaluate
  return result
}

const parseShipAttrs = (
  ships: MasterDataShip[],
  shipCasses: MasterDataShipClass[],
  rows: MasterDataAttrsSheetRow[]
): MasterDataAttrRule[] => {
  const attrs = rows.map((row) => ({
    key: row.key,
    name: row.name,
    evaluate: parseExpr(row.expr),
    ids: Array<number>(),
  }))

  const mutableShips = ships.map(
    (ship): Required<MasterDataShip> => ({
      sortId: 0,
      nextId: 0,
      nextLevel: 0,
      fuel: 0,
      ammo: 0,
      convertible: false,
      ...ship,
    })
  ) as MutableShip[]

  const getShipClassName = (ctype: number) => shipCasses.find((shipClass) => shipClass.id === ctype)?.name || ""

  mutableShips.forEach((ship) => {
    ship.shipClassName = getShipClassName(ship.ctype)

    attrs.forEach((attr) => {
      const result = Boolean(attr.evaluate(ship))
      ship[attr.key] = result
      if (result) attr.ids.push(ship.id)
    })
  })

  return attrs.map(omitEvaluate)
}

export default parseShipAttrs
