import { MapEnemyFleet } from "@fleethub/data"
import masterData from "@fleethub/utils/MasterData"

import Factory from "./Factory"
import { ShipState } from "./ship"
import { FleetState } from "./fleet"
import { Deck4, getPlanStateByDeck } from "./utils"
import { ShipKey, GearKey } from "./common"
import { BattleFleetImpl } from "./battle"
import { EnemyFleetState } from "./plan"

export default class FhSystem {
  public categoryIconIdMap = new Map<number, number>()

  constructor(public factory: Factory) {
    masterData.gearCategories.forEach((categoryData) => {
      const iconId = factory.masterGears.find((gear) => gear.types[2] === categoryData.id)?.types[3]
      iconId && this.categoryIconIdMap.set(categoryData.id, iconId)
    })
  }

  public masterGears = this.factory.masterGears
  public masterShips = this.factory.masterShips

  public createGear = this.factory.createGear
  public createShip = this.factory.createShip
  public createFleet = this.factory.createFleet
  public createAirbase = this.factory.createAirbase
  public createPlan = this.factory.createPlan

  private getEnemyShipState = (shipId: number) => {
    const state: ShipState = { shipId }

    const base = this.factory.findMasterShip(shipId)
    if (!base) return

    if (base.isAbyssal) {
      base.stock.forEach(({ id, stars }, index) => {
        state[`g${index + 1}` as GearKey] = { gearId: id, stars }
      })
    }

    return state
  }

  public mapEnemyFleetToState = (mapEnemyFleet: MapEnemyFleet): EnemyFleetState => {
    const main: FleetState = {}
    const escort: FleetState = {}

    mapEnemyFleet.main.forEach((shipId, index) => {
      main[`s${index + 1}` as ShipKey] = this.getEnemyShipState(shipId)
    })

    mapEnemyFleet.escort?.forEach((shipId, index) => {
      escort[`s${index + 1}` as ShipKey] = this.getEnemyShipState(shipId)
    })

    return { main, escort }
  }

  public createEnemyFleet = (state: EnemyFleetState) => {
    const { main, escort } = state
    const isCombined = Boolean(state)

    return new BattleFleetImpl({
      main: this.createFleet(main),
      escort: escort && this.createFleet(escort),
      fleetType: isCombined ? "Combined" : "Single",
      formation: state.formation || isCombined ? "Cruising4" : "LineAhead",
      side: "Enemy",
    })
  }

  public createPlanByDeck = (deck: Deck4) => {
    const state = getPlanStateByDeck(deck, this.factory.findMasterShip)
    return this.createPlan(state)
  }
}
