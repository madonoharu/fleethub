type MapEnemyShip = number

export type MapEnemyFleet = {
  main: MapEnemyShip[]
  escort?: MapEnemyShip[]
  formations: number[]
  difficulty?: number
}

export const enum MapNodeType {
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

export type MapNode = {
  point: string
  x: number
  y: number
  type: MapNodeType
  d?: number
  enemies?: MapEnemyFleet[]
}

export type MapLink = {
  source: string
  target: string
}

export type MapData = {
  id: number
  nodes: MapNode[]
  links: MapLink[]
}

declare const maps: MapData[]
export default maps
