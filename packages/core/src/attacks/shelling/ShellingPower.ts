import { calcAttackPower } from "../AttackPower"

const ShellingCap = 180

export type ShellingPowerParams = Partial<{
  firepower: number
  improvementBonus: number
  fleetFactor: number

  formationModifier: number
  engagementModifier: number
  healthModifier: number

  cruiserFitBonus: number
  apShellModifier: number
  specialAttackModifier: number
  isAntiInstallation: boolean
}>

const calcBasicPower = ({ firepower = 0, improvementBonus = 0, fleetFactor = 0 }: ShellingPowerParams) => {
  return 5 + firepower + improvementBonus + fleetFactor
}

export const calcShellingPower = (params: ShellingPowerParams) => {
  const {
    formationModifier = 1,
    engagementModifier = 1,
    healthModifier = 1,

    cruiserFitBonus,
    specialAttackModifier,

    apShellModifier,
  } = params

  const basic = calcBasicPower(params)

  const a14 = formationModifier * engagementModifier * healthModifier
  const b14 = cruiserFitBonus
  const a11 = specialAttackModifier

  return calcAttackPower({ basic, cap: ShellingCap, a14, b14, a11, apShellModifier })
}
