import { GearBase } from "@fleethub/core"

type Key = { [K in keyof GearBase]-?: Required<GearBase>[K] extends number ? K : never }[keyof GearBase]

type Comparer = (left: GearBase, right: GearBase) => number

const createComparer = (...keys: Key[]): Comparer => (left, right) => {
  for (const key of keys) {
    const value = right[key] - left[key]
    if (value === 0) continue
    return value
  }
  return 0
}

const reverse = (comparer: Comparer): Comparer => (left, right) => comparer(right, left)

const gunComparer = createComparer("firepower", "torpedo", "accuracy", "armor", "evasion")
const torpedoComparer = createComparer("torpedo", "firepower", "accuracy", "armor", "evasion")
const seaplaneComparer = createComparer("los", "firepower", "accuracy", "armor", "evasion")
const fighterComparer = createComparer("antiAir", "los", "firepower", "accuracy", "armor", "evasion")
const attackerComparer = createComparer("torpedo", "firepower", "los", "antiAir", "accuracy", "armor", "evasion")
const bomberComparer = createComparer("bombing", "firepower", "los", "antiAir", "accuracy", "armor", "evasion")

export const defaultComparer: Comparer = (left, right) => {
  if (left.is("MainGun") || left.categoryIn("SecondaryGun")) return gunComparer(left, right)
  if (left.categoryIn("Torpedo", "SubmarineTorpedo", "MidgetSubmarine")) return torpedoComparer(left, right)
  if (left.is("Seaplane")) return seaplaneComparer(left, right)
  if (left.is("Fighter")) return fighterComparer(left, right)
  if (left.is("TorpedoBomber")) return attackerComparer(left, right)
  if (left.is("DiveBomber")) return bomberComparer(left, right)
  return gunComparer(left, right)
}

export const idComparer = reverse(createComparer("category", "iconId", "id"))
