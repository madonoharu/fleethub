import { FleetType, ShipRole, Side } from "../common"

type FleetFactorRule = {
  player: FleetType
  enemy: FleetType
  playerFactors: [number, number]
  enemyFactors: [number, number]
}

const shellingPowerRules: FleetFactorRule[] = [
  {
    player: "Single",
    enemy: "Combined",
    playerFactors: [5, 5],
    enemyFactors: [10, -5],
  },
  {
    player: "CarrierTaskForce",
    enemy: "Single",
    playerFactors: [2, 10],
    enemyFactors: [10, 5],
  },
  {
    player: "SurfaceTaskForce",
    enemy: "Single",
    playerFactors: [10, -5],
    enemyFactors: [5, -5],
  },
  {
    player: "TransportEscort",
    enemy: "Single",
    playerFactors: [-5, 10],
    enemyFactors: [10, 5],
  },
  {
    player: "CarrierTaskForce",
    enemy: "Combined",
    playerFactors: [2, -5],
    enemyFactors: [10, -5],
  },
  {
    player: "SurfaceTaskForce",
    enemy: "Combined",
    playerFactors: [2, -5],
    enemyFactors: [10, -5],
  },
  {
    player: "TransportEscort",
    enemy: "Combined",
    playerFactors: [-5, -5],
    enemyFactors: [10, -5],
  },
]

const shellingAccuracyRules = [
  {
    fleetType: "CarrierTaskForce",
    factors: [78, 43],
  },
  {
    fleetType: "SurfaceTaskForce",
    factors: [46, 70],
  },
  {
    fleetType: "TransportEscort",
    factors: [51, 46],
  },
]

type FleetState = {
  side: Side
  role: ShipRole
  fleetType: FleetType
}

export const getShellingFleetFactor = (attacker: FleetState, defender: FleetState) => {
  const [player, enemy] = attacker.side === "Player" ? [attacker, defender] : [defender, attacker]
  // 通常vs通常
  if (player.fleetType === "Single" && enemy.fleetType === "Single") {
    return 0
  }

  const found = shellingPowerRules.find((rule) => rule.player === player.fleetType && rule.enemy === enemy.fleetType)
  if (!found) return 0

  const factorIndex = attacker.role === "Main" ? 0 : 1
  const factors = attacker.side === "Player" ? found.playerFactors : found.enemyFactors

  return factors[factorIndex]
}

export const getTorpedoFleetFactor = (attacker: FleetState, defender: FleetState) => {
  const [player, enemy] = attacker.side === "Player" ? [attacker, defender] : [defender, attacker]

  if (enemy.fleetType !== "Single") return 15
  if (player.fleetType === "Single") return 5
  return 0
}

export const getShellingAccuracyFleetFactor = ({ fleetType, role }: FleetState) => {
  const factorIndex = role === "Main" ? 0 : 1
  const factor = shellingAccuracyRules.find((rule) => rule.fleetType === fleetType)?.factors[factorIndex]
  return factor || 90
}

export const getFleetFactors = (attacker: FleetState, defender: FleetState) => {
  const shellingPower = getShellingFleetFactor(attacker, defender)
  const shellingAccuracy = getShellingAccuracyFleetFactor(attacker)

  const torpedoPower = getTorpedoFleetFactor(attacker, defender)

  return {
    shellingPower,
    shellingAccuracy,
    torpedoPower,
  }
}
