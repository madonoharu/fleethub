export type DaySpecialAttackType =
  | "MainMain"
  | "MainApShell"
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
  hasApShell: boolean
  hasRader: boolean

  zuiunAircraftCount: number
  suisei634AircraftCount: number

  hasCbFighterAircraft: boolean
  cbBomberAircraftCount: number
  hasCbTorpedoBomberAircraft: boolean
}

const getArtillerySpottings = (params: DaySpecialAttackParams) => {
  const types: DaySpecialAttackType[] = []

  if (params.mainGunCount >= 2) {
    types.push("DoubleAttack")

    if (params.hasApShell) types.push("MainMain")
  }

  if (params.secondaryGunCount >= 1) {
    types.push("MainSecond")

    if (params.hasRader) types.push("MainRader")
    if (params.hasApShell) types.push("MainApShell")
  }

  return types
}

const getIseClassCutins = ({ zuiunAircraftCount, suisei634AircraftCount }: DaySpecialAttackParams) => {
  const types: DaySpecialAttackType[] = []

  if (zuiunAircraftCount >= 2) types.push("Zuiun")
  if (suisei634AircraftCount >= 2) types.push("Suisei")

  return types
}

const getCarrierCutins = ({
  cbBomberAircraftCount,
  hasCbTorpedoBomberAircraft,
  hasCbFighterAircraft,
}: DaySpecialAttackParams) => {
  const types: DaySpecialAttackType[] = []

  if (cbBomberAircraftCount === 0 || !hasCbTorpedoBomberAircraft) {
    return types
  }

  types.push("BA")
  if (cbBomberAircraftCount >= 2) types.push("BBA")
  if (hasCbFighterAircraft) types.push("FBA")

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
