import { GearCategory, MapEnemyFleet } from "@fleethub/data"

import Factory from "./Factory"
import { ShipState } from "./ship"
import { FleetState } from "./fleet"
import { EnemyFleetImpl, EnemyFleetState } from "./enemy"
import { Deck4, getPlanStateByDeck } from "./utils"
import { ShipKey, GearKey } from "./common"

const allCategories = Object.values(GearCategory).filter((value): value is number => typeof value === "number")

export default class FhSystem {
  public categoryIconIdMap = new Map<GearCategory, number>()

  constructor(public factory: Factory) {
    allCategories.forEach((category) => {
      const iconId = factory.masterGears.find((gear) => gear.category === category)?.iconId
      iconId && this.categoryIconIdMap.set(category, iconId)
    })
  }

  public masterGears = this.factory.masterGears
  public masterShips = this.factory.masterShips

  public createGear = this.factory.createGear
  public createShip = this.factory.createShip
  public createFleet = this.factory.createFleet
  public createAirbase = this.factory.createAirbase
  public createPlan = this.factory.createPlan

  public getAbyssalShipState = (shipId: number) => {
    const state: ShipState = { shipId }

    const base = this.factory.findMasterShip(shipId)
    if (!base || !base.is("Abyssal")) return

    base.gears.forEach((gear, index) => {
      state[`g${index + 1}` as GearKey] = gear
    })

    return state
  }

  public createEnemyFleet = (state: EnemyFleetState) => {
    const { main, escort = {} } = state
    return new EnemyFleetImpl(state, this.createFleet(main), this.createFleet(escort))
  }

  public createEnemyFleetByMapEnemy = (mapEnemyFleet: MapEnemyFleet) => {
    const main: FleetState = {}
    const escort: FleetState = {}

    mapEnemyFleet.main.forEach((shipId, index) => {
      main[`s${index + 1}` as ShipKey] = this.getAbyssalShipState(shipId)
    })

    mapEnemyFleet.escort?.forEach((shipId, index) => {
      escort[`s${index + 1}` as ShipKey] = this.getAbyssalShipState(shipId)
    })

    return this.createEnemyFleet({ main, escort })
  }

  public createPlanByDeck = (deck: Deck4) => {
    const state = getPlanStateByDeck(deck, this.factory.findMasterShip)
    return this.createPlan(state)
  }
}
