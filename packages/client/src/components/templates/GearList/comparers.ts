import { Gear } from "@fleethub/sim"

type Key = { [K in keyof Gear]-?: Required<Gear>[K] extends number ? K : never }[keyof Gear]

type Comparer = (left: Gear, right: Gear) => number

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
const fighterComparer = createComparer("anti_air", "los", "firepower", "accuracy", "armor", "evasion")
const attackerComparer = createComparer("torpedo", "firepower", "los", "anti_air", "accuracy", "armor", "evasion")
const bomberComparer = createComparer("bombing", "firepower", "los", "anti_air", "accuracy", "armor", "evasion")

export const defaultComparer: Comparer = (left, right) => {
  // const categoryIn = (...keys: (keyof typeof GearCategory)[]) =>
  //   keys.map((key) => GearCategory[key]).includes(left.category)

  // const attrIn = (...keys: (keyof typeof GearAttr)[]) => keys.some((key) => left.has_attr(GearAttr[key]))

  // if (attrIn("MainGun") || categoryIn("SecondaryGun")) return gunComparer(left, right)
  // if (categoryIn("Torpedo", "SubmarineTorpedo", "MidgetSubmarine")) return torpedoComparer(left, right)
  // if (attrIn("Seaplane")) return seaplaneComparer(left, right)
  // if (attrIn("Fighter")) return fighterComparer(left, right)
  // if (categoryIn("CbTorpedoBomber", "JetTorpedoBomber")) return attackerComparer(left, right)
  // if (categoryIn("CbDiveBomber", "SeaplaneBomber", "JetFighterBomber")) return bomberComparer(left, right)
  return gunComparer(left, right)
}

export const idComparer = reverse(createComparer("category", "icon_id", "gear_id"))
