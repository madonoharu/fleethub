export const softcap = (cap: number, value: number) => (value > cap ? cap + Math.sqrt(value - cap) : value)

type NumberRecord<T extends string> = { [K in T]?: number }

type PrecapModifierPosition = "a12" | "b12" | "a13" | "b13" | "a13next" | "b13next" | "a14" | "b14"
type PostcapModifierPosition = "a5" | "b5" | "a6" | "b6" | "a11" | "b11"

type PrecapModifiers = NumberRecord<PrecapModifierPosition | "airPower">
type PostcapModifiers = NumberRecord<PostcapModifierPosition | "apShellModifier" | "proficiencyCriticalModifier">

const applyPrecapModifiers = (basic: number, modifiers: PrecapModifiers) => {
  const {
    airPower,

    a12 = 1,
    b12 = 0,
    a13 = 1,
    b13 = 0,
    b13next = 0,
    a13next = 1,
    a14 = 1,
    b14 = 0,
  } = modifiers
  let precap = basic

  precap = precap * a12 + b12
  precap = precap * a13 + b13
  precap = precap * a13next + b13next

  if (airPower !== undefined) {
    precap = Math.floor((precap + airPower) * 1.5) + 25
  }

  precap = precap * a14 + b14

  return precap
}

const applyPostcapModifiers = (capped: number, modifiers: PostcapModifiers) => {
  const {
    a5 = 1,
    b5 = 0,
    a6 = 1,
    b6 = 0,
    a11 = 1,
    b11 = 0,
    apShellModifier,
    proficiencyCriticalModifier = 1,
  } = modifiers
  let normal = capped

  normal = Math.floor(normal * a5 + b5)
  normal = Math.floor(normal * a6 + b6)
  normal = normal * a11 + b11

  if (apShellModifier !== undefined) {
    normal = Math.floor(normal * apShellModifier)
  }

  const critical = Math.floor(normal * 1.5 * proficiencyCriticalModifier)

  return { normal, critical }
}

export type AttackPowerParams = { basic: number; cap: number } & PrecapModifiers & PostcapModifiers

export type AttackPower = {
  basic: number
  precap: number
  isCapped: boolean
  capped: number

  normal: number
  critical: number
}

export const calcAttackPower = ({ basic, cap, ...modifiers }: AttackPowerParams): AttackPower => {
  const precap = applyPrecapModifiers(basic, modifiers)

  const isCapped = precap > cap
  const capped = softcap(cap, precap)

  const { normal, critical } = applyPostcapModifiers(capped, modifiers)

  return { basic, precap, isCapped, capped, normal, critical }
}
