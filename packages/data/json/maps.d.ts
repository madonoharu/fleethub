type MapEnemyShip = number

export type MapEnemyFleet = {
  main: MapEnemyShip[]
  escort?: MapEnemyShip[]
  formations: number[]
  difficulty?: number
}

export type MapNode = {
  point: string
  x: number
  y: number
  type: number
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
