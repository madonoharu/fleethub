import { ShipClass, ShipId } from "@fleethub/data"
import { RequiredShipData } from "./MasterShip"

const or = <T>(...fs: Array<(arg: T) => boolean>) => (arg: T) => fs.some(f => f(arg))

export type ShipMatcher = (ship: RequiredShipData) => boolean

type ShipClassKey = keyof typeof ShipClass

const shipClassIn = (...keys: ShipClassKey[]): ShipMatcher => ship =>
  keys.map(key => ShipClass[key]).includes(ship.shipClass)

const shipIdIn = (...ids: ShipId[]): ShipMatcher => ship => ids.includes(ship.id)

const RoyalNavy = shipClassIn("QueenElizabethClass", "NelsonClass", "ArkRoyalClass", "JClass")
const UsNavy = shipClassIn(
  "JohnCButlerClass",
  "FletcherClass",
  "IowaClass",
  "LexingtonClass",
  "EssexClass",
  "CasablancaClass",
  "ColoradoClass",
  "NorthamptonClass",
  "AtlantaClass"
)
const SovietNavy = or(shipIdIn(ShipId["Верный"]), shipClassIn("TashkentClass", "GangutClass"))

const Installation: ShipMatcher = ship => ship.speed === 0

const SoftSkinned = shipClassIn(
  "AirfieldPrincess",
  "NorthernPrincess",
  "HarbourPrincess",
  "SupplyDepotPrincess",
  "SupplyDepotSummerPrincess"
)
const Pillbox = shipClassIn("ArtilleryImp")
const IsolatedIsland = shipClassIn("IsolatedIslandDemon", "IsolatedIslandPrincess")
const SupplyDepot = shipClassIn("SupplyDepotPrincess", "SupplyDepotSummerPrincess")

/** 未改造 */
const Unremodeled: ShipMatcher = ship => ship.sortId % 10 === 1

/** 改二 */
const Kai2: ShipMatcher = ship => ship.sortId % 10 >= 6 && ship.sortId % 10 < 9

const matchers = {
  RoyalNavy,
  UsNavy,
  SovietNavy,

  Installation,
  SoftSkinned,
  Pillbox,
  SupplyDepot,
  IsolatedIsland,

  Unremodeled,
  Kai2
}

export type ShipAttribute = keyof typeof matchers
const allAttrs = Object.keys(matchers) as ShipAttribute[]

export const createShipAttrs = (ship: RequiredShipData) => allAttrs.filter(attr => matchers[attr](ship))
