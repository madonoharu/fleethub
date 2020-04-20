import { ShipType } from "@fleethub/data"

export type NightSpecialAttackType =
  | "DoubleAttack"
  | "MainTorp"
  | "TorpTorp"
  | "SubmarineTorpTorp"
  | "SubmarineRadarTorp"
  | "MainMainSecond"
  | "MainMainMain"
  | "MainTorpRadar"
  | "TorpLookoutRadar"
  | "AerialAttack1"
  | "AerialAttack2"
  | "AerialAttack3"
  | "SuiseiAttack"

export type NightSpecialAttackTypeParams = {
  shipType: number
  isNightCarrier: boolean

  mainGunCount: number
  secondaryGunCount: number
  torpedoCount: number

  lateModelBowTorpedoCount: number
  hasSubmarineRadar: boolean

  hasSurfaceRadar: boolean
  hasLookout: boolean

  nightFighterCount: number
  nightAttackerCount: number
  hasFuzeBomber: boolean
  semiNightPlaneCount: number
}

const getNightCarrierCutins = ({
  nightFighterCount,
  nightAttackerCount,
  hasFuzeBomber,
  semiNightPlaneCount,
}: NightSpecialAttackTypeParams) => {
  const types: NightSpecialAttackType[] = []

  if (nightFighterCount >= 2 && nightAttackerCount >= 1) {
    types.push("AerialAttack1")
  }
  if (nightFighterCount >= 1 && nightAttackerCount >= 1) {
    types.push("AerialAttack2")
  }
  if (hasFuzeBomber && nightFighterCount + nightAttackerCount >= 1) {
    types.push("SuiseiAttack")
  }

  if (nightFighterCount === 0) {
    return types
  }

  if (nightFighterCount + semiNightPlaneCount >= 3 || nightAttackerCount + semiNightPlaneCount >= 2) {
    types.push("AerialAttack3")
  }

  return types
}

const getDestroyerCutins = ({
  torpedoCount,
  mainGunCount,
  hasSurfaceRadar,
  hasLookout,
}: NightSpecialAttackTypeParams) => {
  const types: NightSpecialAttackType[] = []

  if (torpedoCount === 0 || !hasSurfaceRadar) {
    return types
  }

  if (mainGunCount > 0) {
    types.push("MainTorpRadar")
  }
  if (hasLookout) {
    types.push("TorpLookoutRadar")
  }

  return types
}

const getCommonCutin = ({
  lateModelBowTorpedoCount,
  hasSubmarineRadar,
  mainGunCount,
  secondaryGunCount,
  torpedoCount,
}: NightSpecialAttackTypeParams): NightSpecialAttackType | undefined => {
  if (lateModelBowTorpedoCount >= 1 && hasSubmarineRadar) return "SubmarineRadarTorp"
  if (lateModelBowTorpedoCount >= 2) return "SubmarineTorpTorp"

  if (mainGunCount >= 3) return "MainMainMain"
  if (mainGunCount >= 2 && secondaryGunCount >= 1) return "MainMainSecond"
  if (torpedoCount >= 2) return "TorpTorp"
  if (mainGunCount >= 1 && torpedoCount >= 1) return "MainTorp"
  if (mainGunCount + secondaryGunCount >= 2) return "DoubleAttack"

  return
}

export const getPossibleNightSpecialAttackTypes = (params: NightSpecialAttackTypeParams) => {
  if (params.isNightCarrier) {
    return getNightCarrierCutins(params)
  }

  const types: NightSpecialAttackType[] = []

  if (params.shipType === ShipType.DD) {
    types.push(...getDestroyerCutins(params))
  }

  const commonCutin = getCommonCutin(params)
  if (commonCutin) types.push(commonCutin)

  return types
}
