export type DeckGear = {
  id: number | null
  rf: number | string
  mas: number | string
}

const DeckItemIndexes = ["i1", "i2", "i3", "i4", "i5", "ix"] as const
type DeckItemIndex = typeof DeckItemIndexes[number]

export type DeckItems = Partial<Record<DeckItemIndex, DeckGear>>

export type DeckShip = {
  id: string | number | null
  lv: number
  luck?: number
  hp?: number
  asw?: number
  items: DeckItems
}

const DeckShipIndexes = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const
type DeckShipIndex = typeof DeckShipIndexes[number]

export type DeckFleet = Partial<Record<DeckShipIndex, DeckShip>>

export enum AirCorpsMode {
  Standby,
  Sortie,
  AirDefense,
  Retreat,
  Rest
}

export type DeckAirCorps = {
  mode?: AirCorpsMode
  items: DeckItems
}

export type DeckObject = {
  version: number
  lang?: "ja" | "en" | "ko" | "scn" | "tcn"
  theme?: "dark"
  hqlv?: number
  f1?: DeckFleet
  f2?: DeckFleet
  f3?: DeckFleet
  f4?: DeckFleet
  a1?: DeckAirCorps
  a2?: DeckAirCorps
  a3?: DeckAirCorps
}
