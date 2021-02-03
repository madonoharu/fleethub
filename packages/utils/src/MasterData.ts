import type { Start2 } from "kc-tools"

export type MaybeNumber = number | null

export type StatInterval = [MaybeNumber, MaybeNumber]

export type StockGear = {
  gear_id: number
  stars?: number
}

export type MasterDataShipType = {
  id: number
  name: string
  key: string
}

export type MasterDataShipClass = {
  id: number
  name: string
  key: string
}

export type MasterDataShip = {
  ship_id: number
  name: string
  yomi: string
  stype: number
  ctype?: number
  sort_id?: number

  max_hp: StatInterval
  firepower: StatInterval
  armor: StatInterval
  torpedo: StatInterval
  evasion: StatInterval
  anti_air: StatInterval
  asw: StatInterval
  los: StatInterval
  luck: StatInterval

  speed: number
  range?: number
  fuel?: number
  ammo?: number
  next_id?: number
  next_level?: number

  slotnum: number
  slots: MaybeNumber[]
  stock: StockGear[]

  useful?: boolean
}

export type MasterDataGearCategory = {
  id: number
  name: string
  key: string
}

export type MasterDataGear = {
  gear_id: number
  name: string
  types: [number, number, number, number, number]
  max_hp?: number
  firepower?: number
  armor?: number
  torpedo?: number
  anti_air?: number
  speed?: number
  bombing?: number
  asw?: number
  los?: number
  luck?: number
  accuracy?: number
  evasion?: number
  range?: number
  radius?: number
  cost?: number

  improvable?: boolean
  special_type?: number
  adjusted_anti_air_resistance?: number
  fleet_anti_air_resistance?: number
}

export type MasterDataAttrRule = {
  key: string
  name: string
  expr: string
}

export type MasterDataIBonusRule = {
  expr: string
  formula: string
}

export type IBonusType =
  | "shelling_power"
  | "shelling_accuracy"
  | "torpedo_power"
  | "torpedo_accuracy"
  | "torpedo_evasion"
  | "asw_power"
  | "asw_accuracy"
  | "night_power"
  | "night_accuracy"
  | "defense_power"
  | "contact_selection"
  | "fighter_power"
  | "adjusted_anti_air"
  | "fleet_anti_air"
  | "effective_los"

export type MasterDataIBonuses = Record<IBonusType, MasterDataIBonusRule[]>

export type MasterDataEquippable = {
  equip_stype: { id: number; equip_type: number[] }[]
  equip_exslot: Start2["api_mst_equip_exslot"]
  equip_ship: Start2["api_mst_equip_ship"]
  equip_exslot_ship: Start2["api_mst_equip_exslot_ship"]
}

export type MasterData = {
  ships: MasterDataShip[]
  ship_types: MasterDataShipType[]
  ship_classes: MasterDataShipClass[]
  ship_attrs: MasterDataAttrRule[]
  ship_banners: Record<string, string>
  gears: MasterDataGear[]
  gear_categories: MasterDataGearCategory[]
  gear_attrs: MasterDataAttrRule[]
  ibonuses: MasterDataIBonuses
  equippable: MasterDataEquippable
}
