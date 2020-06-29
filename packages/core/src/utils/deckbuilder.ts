import { GearState } from "../gear"
import ProficiencyExp from "./ProficiencyExp"
import { EquipmentState, GearKey, Equipment } from "../equipment"
import { ShipState, ShipBase, Ship } from "../ship"
import { FleetState, ShipKey, Fleet } from "../fleet"
import { AirbaseState } from "../airbase"
import { PlanState, FleetKey, AirbaseKey, Plan } from "../plan"
import { Dict } from "@fleethub/utils"

export type DeckGear = {
  id: number | null
  rf?: number | string
  mas?: number | string
}

const DeckItemKeys = ["i1", "i2", "i3", "i4", "i5", "ix"] as const
type DeckItemKey = typeof DeckItemKeys[number]

export type DeckItems = Dict<DeckItemKey, DeckGear>

export type DeckShip = {
  id: string | number | null
  lv: number
  luck?: number
  hp?: number
  asw?: number
  items?: DeckItems
}

const DeckShipkeys = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const

export type DeckFleet = Dict<ShipKey, DeckShip>

export type DeckAirbase = {
  items: DeckItems
}

export type Deck4 = {
  version: 4
  hqlv?: number
} & Dict<FleetKey, DeckFleet> &
  Dict<AirbaseKey, DeckAirbase>

const toNumber = (val: unknown) => {
  const num = Number(val)
  return Number.isNaN(num) ? undefined : num
}

const getGearState = ({ id, rf, mas }: DeckGear): GearState => ({
  gearId: toNumber(id) || 0,
  stars: toNumber(rf),
  exp: ProficiencyExp.aceToExp(toNumber(mas) || 0),
})

const getEquipmentState = (source: DeckItems): EquipmentState => {
  const state: EquipmentState = {}

  DeckItemKeys.forEach((key) => {
    const deckGear = source[key]
    if (deckGear) state[key.replace("i", "g") as GearKey] = getGearState(deckGear)
  })

  return state
}

type FindShip = (id: number) => ShipBase | undefined

const getShip = ({ id, lv, items, luck, hp, asw }: DeckShip, findShip: FindShip): ShipState => {
  const shipId = toNumber(id) || 0
  const equip = getEquipmentState(items || {})
  const state: ShipState = { shipId, level: toNumber(lv), ...equip }

  const base = findShip(shipId)

  if (!base) return state

  if (luck) {
    state.luck = luck - base.luck[0]
  }
  if (hp) {
    state.maxHp = hp - base.maxHp[0]
  }
  if (asw) {
    state.asw = asw - base.asw[0]
  }

  return state
}

const getFleet = (source: DeckFleet, findShip: FindShip): FleetState => {
  const state: FleetState = {}
  DeckShipkeys.forEach((key) => {
    const deckShip = source[key]
    if (deckShip) state[key] = getShip(deckShip, findShip)
  })

  return state
}

const getAirbase = (source: DeckAirbase): AirbaseState => getEquipmentState(source.items)

const AirbaseKeys = ["a1", "a2", "a3"] as const
const FleetKeys = ["f1", "f2", "f3", "f4"] as const

export const getPlanStateByDeck = (deck: Deck4, findShip: FindShip): PlanState => {
  const state: PlanState = {}

  FleetKeys.forEach((key) => {
    const deckFleet = deck[key]
    if (deckFleet) state[key] = getFleet(deckFleet, findShip)
  })

  AirbaseKeys.forEach((key) => {
    const deckAirbase = deck[key]
    if (deckAirbase) state[key] = getAirbase(deckAirbase)
  })

  return state
}

export const getDeckItems = (equipment: Equipment): DeckItems => {
  const items: DeckItems = {}

  equipment.forEach((gear, key) => {
    items[key.replace("g", "i") as keyof typeof items] = {
      id: gear.gearId,
      rf: gear.stars || undefined,
      mas: gear.ace || undefined,
    }
  })

  return items
}

const getDeck4Ship = (ship: Ship): DeckShip => {
  const items = getDeckItems(ship.equipment)

  return {
    id: ship.shipId,
    lv: ship.level,
    items,
    luck: ship.luck.displayed,
  }
}

const getDeck4Fleet = (fleet: Fleet): DeckFleet => {
  const deckFleet: Dict<ShipKey, ReturnType<typeof getDeck4Ship>> = {}

  fleet.entries.forEach(([key, ship]) => {
    if (!ship) return
    deckFleet[key] = getDeck4Ship(ship)
  })

  return deckFleet
}

export const getDeck4 = (plan: Plan) => {
  const deck: Deck4 = { version: 4, hqlv: plan.hqLevel }

  plan.fleetEntries.forEach(([key, fleet]) => {
    if (fleet.ships.length === 0) return
    deck[key] = getDeck4Fleet(fleet)
  })

  plan.airbaseEntries.forEach(([key, airbase]) => {
    if (airbase.equipment.gears.length === 0) return
    const items = getDeckItems(airbase.equipment)
    deck[key] = { items }
  })

  return deck
}
