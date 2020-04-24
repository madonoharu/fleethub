export type GearData = {
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

declare const gears: GearData[]
export default gears
