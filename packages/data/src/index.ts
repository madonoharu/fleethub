import { default as ships, ShipData } from "../json/ships"
import { default as gears, GearData } from "../json/gears"
import { default as equippable, EquippableData, ShipEquippable, ShipTypeEquippable } from "../json/equippable"
import { default as maps, MapEnemyFleet, MapNodeType, MapNode, MapLink, MapData } from "../json/maps"

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
  MapNodeType,
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
