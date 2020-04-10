export type ShipStat = number | [number, number]

export interface ShipData {
  id: number

  sortNo?: number
  sortId?: number

  name: string
  ruby: string
  shipType: number
  shipClass: number

  hp: ShipStat
  firepower: ShipStat
  armor: ShipStat
  torpedo: ShipStat
  evasion: ShipStat
  antiAir: ShipStat
  asw: ShipStat
  los: ShipStat
  luck: ShipStat

  speed: number
  range: number

  fuel: number
  ammo: number

  slots: number[]
  gears: Array<number | { gearId: number; stars?: number }>

  nextId?: number
  nextLevel?: number
  convertible?: boolean
}

declare const ships: ShipData[]

export default ships
