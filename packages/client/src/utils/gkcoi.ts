import { DeckBuilder, DeckBuilderFleet, DeckBuilderShip } from "gkcoi"
import { Ship, Fleet, Plan, getDeckItems } from "@fleethub/core"

const getGkcoiShip = (ship: Ship): DeckBuilderShip => {
  const items = getDeckItems(ship.equipment)

  return {
    id: ship.shipId,
    lv: ship.level,
    items,
    hp: ship.maxHp.displayed,
    fp: ship.firepower.displayed,
    tp: ship.torpedo.displayed,
    aa: ship.antiAir.displayed,
    ar: ship.armor.displayed,
    asw: ship.asw.displayed,
    ev: ship.evasion.displayed,
    los: ship.los.displayed,
    luck: ship.luck.displayed,
  }
}

const getGkcoiFleet = (fleet: Fleet): DeckBuilderFleet => {
  const deckFleet: DeckBuilderFleet = {}

  fleet.entries.forEach(([key, ship]) => {
    if (!ship) return
    deckFleet[key] = getGkcoiShip(ship)
  })

  return deckFleet
}

export type GkcoiTheme = DeckBuilder["theme"]

export const gkcoiThemes: GkcoiTheme[] = ["dark", "dark-ex", "official", "74lc", "74mc", "74sb"]

export const getGkcoiDeck = (plan: Plan, theme: GkcoiTheme = "dark") => {
  const deck: DeckBuilder = { lang: "jp", theme, hqlv: plan.hqLevel }

  plan.fleetEntries.forEach(([key, fleet]) => {
    if (fleet.ships.length === 0) return
    deck[key] = getGkcoiFleet(fleet)
  })

  plan.airbaseEntries.forEach(([key, airbase]) => {
    if (airbase.equipment.gears.length === 0) return
    const items = getDeckItems(airbase.equipment)
    deck[key] = { items }
  })

  return deck
}
