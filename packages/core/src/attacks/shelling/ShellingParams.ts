import { ShipClass } from "@fleethub/data"

type ApShellModifiersParams = {
  hasApShell: boolean
  hasMainGun: boolean
  hasSecondaryGun: boolean
  hasRader: boolean
}

type ApShellModifiers = { power: number; accuracy: number }
/**
 * 徹甲弾補正
 */
export const getApShellModifiers = (params: ApShellModifiersParams): ApShellModifiers => {
  const modifier = { power: 1, accuracy: 1 }

  const { hasApShell, hasMainGun, hasRader, hasSecondaryGun } = params

  if (!hasApShell || !hasMainGun) {
    return modifier
  }

  if (hasSecondaryGun && hasRader) {
    return { power: 1.15, accuracy: 1.3 }
  }
  if (hasSecondaryGun) {
    return { power: 1.15, accuracy: 1.2 }
  }
  if (hasRader) {
    return { power: 1.1, accuracy: 1.25 }
  }
  return { power: 1.08, accuracy: 1.1 }
}

type ShellingTypeParams = {
  shipClass: ShipClass
  isAircraftCarrierClass: boolean
  isInstallation: boolean
  hasCarrierShellingPlane: boolean
}

type ShellingType = "Shelling" | "CarrierShelling"

export const getShellingType = ({
  isAircraftCarrierClass,
  isInstallation,
  shipClass,
  hasCarrierShellingPlane,
}: ShellingTypeParams) => {
  if (isAircraftCarrierClass) {
    return "CarrierShelling"
  }

  if (shipClass !== ShipClass.RevisedKazahayaClass && !isInstallation) {
    return "Shelling"
  }

  if (hasCarrierShellingPlane) {
    return "CarrierShelling"
  }

  return "Shelling"
}

type ShellingParams = {
  shellingType: ShellingType
  apShellModifiers: ApShellModifiers
}
