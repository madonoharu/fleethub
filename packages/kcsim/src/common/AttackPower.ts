import { flow } from "lodash-es"
import { softcap } from "../utils"

export type NumberRecord<T extends string> = { [K in T]?: number }

export type FunctionalModifier = (value: number) => number

type PrecapModifierPosition = "a12" | "a13" | "a13next" | "a14" | "b12" | "b13" | "b13next" | "b14"
type PrecapModifierRecord = NumberRecord<PrecapModifierPosition>

type PostcapModifierPosition = "a5" | "a6" | "a11" | "b5" | "b6" | "b11"
type PostcapModifierRecord = NumberRecord<PostcapModifierPosition>

type AttackPowerModifierPosition = PrecapModifierPosition | PostcapModifierPosition
export type AttackPowerModifierRecord = NumberRecord<AttackPowerModifierPosition>

export type AttackPowerFactors = {
  basic: number
  cap: number
  modifiers: AttackPowerModifierRecord
  fm14prev?: FunctionalModifier
  fm11next?: FunctionalModifier
}

export type AttackPower = {
  precap: number
  isCapped: boolean
  capped: number
  postcap: number
}

const setModifier = (record: AttackPowerModifierRecord, mod: AttackPowerModifierRecord) => {
  ;(Object.entries(mod) as Array<[AttackPowerModifierPosition, number?]>).forEach(([key, value]) => {
    if (typeof value !== "number") {
      return
    }
    let next: number
    if (key.startsWith("a")) {
      next = (record[key] || 1) * value
    } else {
      next = (record[key] || 0) + value
    }
    record[key] = next
  })
}

export const composeAttackPowerModifierRecord = (...args: Array<AttackPowerModifierRecord | undefined>) => {
  const result: AttackPowerModifierRecord = {}

  args.forEach(mod => mod && setModifier(result, mod))

  return result
}

export const createFm = (a = 1, b = 0, floor = false): FunctionalModifier => value => {
  const result = value * a + b
  if (floor) {
    return Math.floor(result)
  }
  return result
}

export const createCriticalFm = (proficiencyModifier = 1): FunctionalModifier => value =>
  Math.floor(value * 1.5 * proficiencyModifier)

const carrierShellingFm: FunctionalModifier = value => 25 + Math.floor(value * 1.5)

export const createPrecapFm = (modifiers: PrecapModifierRecord, fm14prev?: FunctionalModifier): FunctionalModifier => {
  const { a12, a13, a13next, a14, b12, b13, b13next, b14 } = modifiers
  const fm12 = createFm(a12, b12)
  const fm13 = createFm(a13, b13)
  const fm13next = createFm(a13next, b13next)
  const fm14 = createFm(a14, b14)

  if (fm14prev) {
    return flow(fm12, fm13, fm13next, fm14prev, fm14)
  }

  return flow(fm12, fm13, fm13next, fm14)
}

export const createPostcapFm = (modifiers: PostcapModifierRecord): FunctionalModifier => {
  const { a5, a6, a11, b5, b6, b11 } = modifiers
  const fm5 = createFm(a5, b5, true)
  const fm6 = createFm(a6, b6, true)
  const fm11 = createFm(a11, b11)
  return flow(fm5, fm6, fm11)
}

export const createAttackPower = ({ basic, cap, modifiers, fm14prev, fm11next }: AttackPowerFactors): AttackPower => {
  const precapFm = createPrecapFm(modifiers, fm14prev)
  const postcapFm = createPostcapFm(modifiers)

  const precap = precapFm(basic)
  const isCapped = cap < precap
  const capped = softcap(cap, precap)
  let postcap = postcapFm(capped)
  if (fm11next) {
    postcap = fm11next(postcap)
  }
  return { precap, isCapped, capped, postcap }
}
