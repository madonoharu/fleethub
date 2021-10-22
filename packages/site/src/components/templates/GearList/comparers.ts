import { Gear } from "fleethub-core";

type Key = {
  [K in keyof Gear]-?: Required<Gear>[K] extends number ? K : never;
}[keyof Gear];

type Comparer = (left: Gear, right: Gear) => number;

const createComparer =
  (...keys: Key[]): Comparer =>
  (left, right) => {
    for (const key of keys) {
      const value = right[key] - left[key];
      if (value === 0) continue;
      return value;
    }
    return 0;
  };

const reverse =
  (comparer: Comparer): Comparer =>
  (left, right) =>
    comparer(right, left);

const gunComparer = createComparer(
  "firepower",
  "torpedo",
  "accuracy",
  "armor",
  "evasion"
);
const torpedoComparer = createComparer(
  "torpedo",
  "firepower",
  "accuracy",
  "armor",
  "evasion"
);
const seaplaneComparer = createComparer(
  "los",
  "firepower",
  "accuracy",
  "armor",
  "evasion"
);
const fighterComparer = createComparer(
  "anti_air",
  "los",
  "firepower",
  "accuracy",
  "armor",
  "evasion"
);
const attackerComparer = createComparer(
  "torpedo",
  "firepower",
  "los",
  "anti_air",
  "accuracy",
  "armor",
  "evasion"
);
const bomberComparer = createComparer(
  "bombing",
  "firepower",
  "los",
  "anti_air",
  "accuracy",
  "armor",
  "evasion"
);

export const defaultComparer: Comparer = (left, right) => {
  // const typeIn = (...keys: (keyof typeof GearType)[]) =>
  //   keys.map((key) => GearType[key]).includes(left.gear_type)

  // const attrIn = (...keys: (keyof typeof GearAttr)[]) => keys.some((key) => left.has_attr(GearAttr[key]))

  // if (attrIn("MainGun") || typeIn("SecondaryGun")) return gunComparer(left, right)
  // if (typeIn("Torpedo", "SubmarineTorpedo", "MidgetSubmarine")) return torpedoComparer(left, right)
  // if (attrIn("Seaplane")) return seaplaneComparer(left, right)
  // if (attrIn("Fighter")) return fighterComparer(left, right)
  // if (typeIn("CbTorpedoBomber", "JetTorpedoBomber")) return attackerComparer(left, right)
  // if (typeIn("CbDiveBomber", "SeaplaneBomber", "JetFighterBomber")) return bomberComparer(left, right)
  return gunComparer(left, right);
};

export const idComparer = reverse(
  createComparer("gear_type_id", "icon_id", "gear_id")
);
