import { ShipClass, ShipId, ShipType, HullCode } from "@fleethub/data"

import { ShipIdentityWithSpeed } from "./types"

const or = <T>(...fs: Array<(arg: T) => boolean>) => (arg: T) => fs.some((f) => f(arg))

export type ShipMatcher = (ship: ShipIdentityWithSpeed) => boolean

type ShipClassKey = keyof typeof ShipClass

const shipClassIn = (...keys: ShipClassKey[]): ShipMatcher => (ship) =>
  keys.map((key) => ShipClass[key]).includes(ship.shipClass)

const shipTypeIn = (...args: HullCode[]): ShipMatcher => (ship) =>
  args.map((arg) => ShipType[arg]).includes(ship.shipType)

const shipIdIn = (...ids: ShipId[]): ShipMatcher => (ship) => ids.includes(ship.shipId)

/** 深海棲艦 */
const Abyssal: ShipMatcher = (ship) => ship.shipId > 1500

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

const Installation: ShipMatcher = (ship) => ship.speed === 0

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
const Unremodeled: ShipMatcher = (ship) => ship.sortId % 10 === 1

/** 改二 */
const Kai2: ShipMatcher = (ship) => ship.sortId % 10 >= 6 && ship.sortId % 10 < 9

/**
 * 軽巡級
 * 軽巡,雷巡,練巡
 */
const LightCruiserClass = shipTypeIn("CL", "CLT", "CT")

/**
 * 重巡級
 * 重巡,航巡
 */
const HeavyCruiserClass = shipTypeIn("CA", "CAV")

/**
 * 戦艦級
 * 戦艦,巡洋戦艦,航空戦艦,超弩級戦艦
 */
const BattleshipClass = shipTypeIn("FBB", "BB", "BBV")

/**
 * 空母級
 * 軽空母,正規空母,装甲空母
 */
const AircraftCarrierClass = shipTypeIn("CVL", "CV", "CVB")

/**
 * 潜水級
 */
const SubmarineClass = shipTypeIn("SS", "SSV")

/**
 * 徹甲弾が有効な艦種
 */
const Armored = shipTypeIn("CA", "CAV", "FBB", "BB", "BBV", "CV", "CVB")

const matchers = {
  Abyssal,

  RoyalNavy,
  UsNavy,
  SovietNavy,

  Installation,
  SoftSkinned,
  Pillbox,
  SupplyDepot,
  IsolatedIsland,

  Unremodeled,
  Kai2,

  LightCruiserClass,
  HeavyCruiserClass,
  BattleshipClass,
  AircraftCarrierClass,
  SubmarineClass,

  Armored,
}

export type ShipAttribute = keyof typeof matchers
const allAttrs = Object.keys(matchers) as ShipAttribute[]

export const createShipAttrs = (ship: ShipIdentityWithSpeed): ShipAttribute[] =>
  allAttrs.filter((attr) => matchers[attr](ship))
