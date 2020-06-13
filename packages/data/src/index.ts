import { default as ships, ShipData } from "../json/ships"
import { default as gears, GearData } from "../json/gears"
import { default as equippable, EquippableData, ShipEquippable, ShipTypeEquippable } from "../json/equippable"
import { default as maps, MapEnemyFleet, MapNode, MapLink, MapData } from "../json/maps"

export enum MapNodeType {
  Unknown = -1,
  Start = 0,
  Resource = 2,
  Maelstrom = 3,
  Normal = 4,
  Boss = 5,
  Transport = 6,
  Aerial = 7,
  Bounty = 8,
  AerialReconnaissance = 9,
  AirDefense = 10,
  NightBattle = 11,
  LongRangeRadarAmbush = 13,
  EmergencyAnchorageRepair = 14,

  NoEnemy = 90,
  Selector = 91,
}

export {
  ships,
  ShipData,
  gears,
  GearData,
  equippable,
  EquippableData,
  ShipEquippable,
  ShipTypeEquippable,
  maps,
  MapEnemyFleet,
  MapNode,
  MapLink,
  MapData,
}

export * from "./GearCategory"
export * from "./GearCategoryName"
export * from "./ShipClass"
export * from "./ShipClassName"
export * from "./ShipType"

export * from "./GearId"
export * from "./GearName"
export * from "./ShipId"
export * from "./ShipName"
export * from "./ShipRuby"
