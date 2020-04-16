/** 艦種ごとのデフォルト装備可能設定 */
export type ShipTypeEquippable = {
  id: number
  categories: number[]
}

/** 艦娘固有の装備可能設定 */
export type ShipEquippable = {
  id: number
  /** 装備カテゴリによる設定 */
  categories?: number[]
  /** 補強増設に装備できるID一覧 */
  exslot?: number[]
}

export type EquippableData = {
  shipType: ShipTypeEquippable[]
  ship: ShipEquippable[]
  /** 増設のデフォルト装備可能カテゴリ */
  exslotCategories: number[]
}

declare const equippable: EquippableData
export default equippable
