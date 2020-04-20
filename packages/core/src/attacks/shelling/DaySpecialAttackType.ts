export type DaySpecialAttackType =
  | "MainMain"
  | "MainAPShell"
  | "MainRader"
  | "MainSecond"
  | "DoubleAttack"
  | "Zuiun"
  | "Suisei"
  | "FBA"
  | "BBA"
  | "BA"

export type DaySpecialAttackParams = {
  isCarrierShelling: boolean
  isIseClassK2: boolean
  hasObservationSeaplane: boolean

  mainGunCount: number
  secondaryGunCount: number
  hasAPShell: boolean
  hasRader: boolean

  zuiunCount: number
  suisei634Count: number

  hasFighter: boolean
  bomberCount: number
  hasTorpedoBomber: boolean
}

const getArtillerySpottings = (params: DaySpecialAttackParams) => {
  const types: DaySpecialAttackType[] = []

  if (params.mainGunCount >= 2) {
    types.push("DoubleAttack")

    if (params.hasAPShell) types.push("MainMain")
  }

  if (params.secondaryGunCount >= 1) {
    types.push("MainSecond")

    if (params.hasRader) types.push("MainRader")
    if (params.hasAPShell) types.push("MainAPShell")
  }

  return types
}

const getIseClassCutins = ({ zuiunCount, suisei634Count }: DaySpecialAttackParams) => {
  const types: DaySpecialAttackType[] = []

  if (zuiunCount >= 2) types.push("Zuiun")
  if (suisei634Count >= 2) types.push("Suisei")

  return types
}

const getCarrierCutins = ({ bomberCount, hasTorpedoBomber, hasFighter }: DaySpecialAttackParams) => {
  const types: DaySpecialAttackType[] = []

  if (bomberCount === 0 || !hasTorpedoBomber) {
    return types
  }

  types.push("BA")
  if (bomberCount >= 2) types.push("BBA")
  if (hasFighter) types.push("FBA")

  return types
}

export const getPossibleDaySpecialAttackTypes = (params: DaySpecialAttackParams) => {
  if (params.isCarrierShelling) {
    return getCarrierCutins(params)
  }

  const types: DaySpecialAttackType[] = []

  if (params.mainGunCount === 0) return types

  if (params.isIseClassK2) {
    const iseClassCutinKeys = getIseClassCutins(params)
    types.push(...iseClassCutinKeys)
  }

  if (!params.hasObservationSeaplane) return types
  const artillerySpottingKeys = getArtillerySpottings(params)
  types.push(...artillerySpottingKeys)

  return types
}
