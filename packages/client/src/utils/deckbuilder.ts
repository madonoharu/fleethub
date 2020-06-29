import { DeckBuilder, DeckBuilderFleet, DeckBuilderShip, DeckBuilderAirbase } from "gkcoi"
import { Ship, Fleet, Plan, Equipment, ShipKey, FleetKey, AirbaseKey } from "@fleethub/core"
import { Dict } from "@fleethub/utils"

import { getDeckItems } from "./gkcoi"

const getDeck4Ship = (ship: Ship) => {
  const items = getDeckItems(ship.equipment)

  return {
    id: ship.shipId,
    lv: ship.level,
    items,
    luck: ship.luck.displayed,
  }
}

const getDeck4Fleet = (fleet: Fleet) => {
  const deckFleet: Dict<ShipKey, ReturnType<typeof getDeck4Ship>> = {}

  fleet.entries.forEach(([key, ship]) => {
    if (!ship) return
    deckFleet[key] = getDeck4Ship(ship)
  })

  return deckFleet
}

type Deck4 = { version: 4; hqlv: number } & Dict<FleetKey, ReturnType<typeof getDeck4Fleet>> &
  Dict<AirbaseKey, DeckBuilderAirbase>

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

const getPredeckUrl = (base: string, plan: Plan) => {
  const url = new URL("https://noro6.github.io/kcTools/")
  const deck = getDeck4(plan)

  url.searchParams.set("predeck", JSON.stringify(deck))
  if (url.href.length < 7900) return url.href

  delete deck.f4
  url.searchParams.set("predeck", JSON.stringify(deck))
  if (url.href.length < 7900) return url.href

  delete deck.f3
  url.searchParams.set("predeck", JSON.stringify(deck))
  return url.href
}

export const openKctools = (plan: Plan) => {
  const url = getPredeckUrl("https://noro6.github.io/kcTools/", plan)
  window.open(url, "_blank", "noopener")
}

export const openDeckbuilder = (plan: Plan) => {
  const url = getPredeckUrl("http://kancolle-calc.net/deckbuilder.html", plan)
  window.open(url, "_blank", "noopener")
}
