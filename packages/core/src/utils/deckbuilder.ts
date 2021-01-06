import { Dict } from "@fleethub/utils"

import { ProficiencyExp, GearKey, ShipKey, ShipKeys, FleetKey, FleetKeys, AirbaseKey, AirbaseKeys } from "../common"
import { GearState } from "../gear"
import { EquipmentState, Equipment } from "../equipment"
import { ShipState, Ship } from "../ship"
import { FleetState, Fleet } from "../fleet"
import { AirbaseState } from "../airbase"
import { PlanState, Plan } from "../plan"
import { MasterShip } from "../MasterDataAdapter"

export type DeckGear = {
  id: number
  rf?: number
  mas?: number
}

const DeckItemKeys = ["i1", "i2", "i3", "i4", "i5", "ix"] as const
type DeckItemKey = typeof DeckItemKeys[number]

export type DeckItems = Dict<DeckItemKey, DeckGear>

export type DeckShip = {
  id: number
  lv?: number
  luck?: number
  hp?: number
  asw?: number
  items?: DeckItems
}

export type DeckFleet = Dict<ShipKey, DeckShip>

export type DeckAirbase = {
  items?: DeckItems
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

type FindShip = (id: number) => MasterShip | undefined

const getShip = ({ id, lv, items, luck, hp, asw }: DeckShip, findShip: FindShip): ShipState => {
  const shipId = toNumber(id) || 0
  const equip = getEquipmentState(items || {})
  const state: ShipState = { shipId, level: toNumber(lv), ...equip }

  const base = findShip(shipId)

  if (!base) return state

  if (luck && luck > 0) {
    state.luck = luck - (base.luck[0] || 0)
  }
  if (hp && hp > 0) {
    state.maxHp = hp - (base.maxHp[0] || 0)
  }
  if (asw && asw > 0) {
    state.asw = asw - (base.asw[0] || 0)
  }

  return state
}

const getFleet = (source: DeckFleet, findShip: FindShip): FleetState => {
  const state: FleetState = {}
  ShipKeys.forEach((key) => {
    const deckShip = source[key]
    if (deckShip) state[key] = getShip(deckShip, findShip)
  })

  return state
}

const getAirbase = (source: DeckAirbase): AirbaseState => getEquipmentState(source.items || {})

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

export const getDeckItems = (equipment: Equipment) => {
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
    luck: ship.luck.value,
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
