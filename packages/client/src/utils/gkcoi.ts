import { DeckBuilder, DeckBuilderFleet, DeckBuilderShip, DeckBuilderAirbase } from "gkcoi"
import { Ship, Fleet, Plan, Equipment, ShipKey, FleetKey, AirbaseKey } from "@fleethub/core"
import { Dict } from "@fleethub/utils"

export const getDeckItems = (equipment: Equipment) => {
  const items: DeckBuilderShip["items"] = {}
  equipment.forEach((gear, key) => {
    items[key.replace("g", "i") as keyof typeof items] = {
      id: gear.gearId,
      rf: gear.stars,
      mas: gear.ace,
    }
  })

  return items
}

const shipToDeck = (ship: Ship): DeckBuilderShip => {
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

const fleetToDeck = (fleet: Fleet): DeckBuilderFleet => {
  const deckFleet: DeckBuilderFleet = {}

  fleet.entries.forEach(([key, ship]) => {
    if (!ship) return
    deckFleet[key] = shipToDeck(ship)
  })

  return deckFleet
}

export type GkcoiTheme = DeckBuilder["theme"]

export const gkcoiThemes: GkcoiTheme[] = ["dark", "dark-ex", "official", "74lc", "74mc", "74sb"]

export const planToDeck = (plan: Plan, theme: GkcoiTheme = "dark") => {
  const deck: DeckBuilder = { lang: "en", theme, hqlv: plan.hqLevel }

  plan.fleetEntries.forEach(([key, fleet]) => {
    if (fleet.ships.length === 0) return
    deck[key] = fleetToDeck(fleet)
  })

  plan.airbaseEntries.forEach(([key, airbase]) => {
    if (airbase.equipment.gears.length === 0) return
    const items = getDeckItems(airbase.equipment)
    deck[key] = { items }
  })

  return deck
}
