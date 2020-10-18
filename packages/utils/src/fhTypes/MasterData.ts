export type MaybeNumber = number | null

export type StatInterval = [left: MaybeNumber, right: MaybeNumber]

export type StockGear = { id: number; stars?: number }

export type MasterDataShip = {
  id: number
  name: string
  yomi: string
  shipType: number
  shipClass: number
  sortId?: number

  maxHp: StatInterval
  firepower: StatInterval
  armor: StatInterval
  torpedo: StatInterval
  evasion: StatInterval
  antiAir: StatInterval
  asw: StatInterval
  los: StatInterval
  luck: StatInterval

  speed: number
  range: MaybeNumber
  fuel?: number
  ammo?: number

  slotnum: number
  slots: MaybeNumber[]
  stock: StockGear[]

  nextId?: number
  nextLevel?: number
  convertible?: boolean
}

export type MasterDataShipType = { id: number; name: string; key: string }
export type MasterDataShipClass = MasterDataShipType

export type MasterDataGearCategory = { id: number; name: string; key: string }

export type MasterDataGear = {
  id: number
  category: number
  iconId: number
  name: string

  maxHp?: number
  firepower?: number
  armor?: number
  torpedo?: number
  antiAir?: number
  speed?: number
  bombing?: number
  asw?: number
  los?: number
  luck?: number

  accuracy?: number
  evasion?: number
  antiBomber?: number
  interception?: number

  range?: number
  radius?: number
  cost?: number

  improvable?: boolean
}

export type MasterDataAttrRule = { name: string; key: string; ids: number[] }

export type MasterDataImprovementBonusRule = { formula: string; ids: number[] }

export type ImprovementBonusType =
  | "shellingPower"
  | "shellingAccuracy"
  | "torpedoPower"
  | "torpedoAccuracy"
  | "torpedoEvasion"
  | "aswPower"
  | "aswAccuracy"
  | "nightPower"
  | "nightAccuracy"
  | "defensePower"
  | "contactSelection"
  | "fighterPower"
  | "adjustedAntiAir"
  | "fleetAntiAir"
  | "effectiveLos"

export type MasterDataImprovementBonuses = Record<ImprovementBonusType, MasterDataImprovementBonusRule[]>

export type MasterData = {
  ships: MasterDataShip[]
  shipTypes: MasterDataShipType[]
  shipClasses: MasterDataShipClass[]

  gearCategories: MasterDataGearCategory[]
  gears: MasterDataGear[]

  gearAttrs: MasterDataAttrRule[]
  shipAttrs: MasterDataAttrRule[]

  improvementBonuses: MasterDataImprovementBonuses
}
