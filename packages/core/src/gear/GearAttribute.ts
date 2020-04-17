import { GearData, GearId, GearCategory, GearCategoryKey } from "@fleethub/data"

type GearMatcher = (gear: Required<GearData>) => boolean

const gearIdIn = (...gearIds: GearId[]): GearMatcher => (data) => gearIds.includes(data.id)

const categoryIn = (...keys: GearCategoryKey[]): GearMatcher => (data) =>
  keys.map((key) => GearCategory[key]).includes(data.category)

const or = (...args: GearMatcher[]): GearMatcher => (gear) => args.some((arg) => arg(gear))
const and = (...args: GearMatcher[]): GearMatcher => (gear) => args.every((arg) => arg(gear))

/** 深海装備 */
const Abyssal: GearMatcher = (gear) => gear.id > 500

/** 高角砲 */
const HighAngleMount: GearMatcher = (gear) => gear.iconId === 16

/** 主砲 */
const MainGun = categoryIn("SmallCaliberMainGun", "MediumCaliberMainGun", "LargeCaliberMainGun")

/** 電探 */
const Radar = categoryIn("SmallRadar", "LargeRadar")
/** 水上電探 */
const SurfaceRadar = and(Radar, ({ los }) => los >= 5)
/** 対空電探 */
const AirRadar = and(Radar, ({ antiAir }) => antiAir >= 2)

/** バルジ */
const Armor = categoryIn("ExtraArmor", "MediumExtraArmor", "LargeExtraArmor")

/** 対潜火力装備 */
const AswGear = categoryIn(
  "Sonar",
  "DepthCharge",
  "LargeSonar",

  "CarrierBasedDiveBomber",
  "CarrierBasedTorpedoBomber",
  "SeaplaneBomber",
  "Autogyro",
  "AntiSubmarinePatrolAircraft"
)

/** 対潜航空機 */
const AswAircraft = and(
  ({ asw }) => asw > 0,
  categoryIn(
    "CarrierBasedDiveBomber",
    "CarrierBasedTorpedoBomber",
    "SeaplaneBomber",
    "Autogyro",
    "AntiSubmarinePatrolAircraft",
    "LargeFlyingBoat"
  )
)

/** 爆雷投射機 */
const DepthChargeProjector = gearIdIn(GearId["九四式爆雷投射機"], GearId["三式爆雷投射機"])

/** 増加爆雷 */
const AdditionalDepthCharge = gearIdIn(GearId["九五式爆雷"], GearId["二式爆雷"])

/** 迫撃砲 */
const Mortar = gearIdIn(GearId["二式12cm迫撃砲改"], GearId["二式12cm迫撃砲改 集中配備"])

/** 対地噴進砲 */
const AntiGroundRocketLauncher = gearIdIn(GearId["艦載型 四式20cm対地噴進砲"], GearId["四式20cm対地噴進砲 集中配備"])

/** 水上機 */
const Seaplane = categoryIn("ReconnaissanceSeaplane", "SeaplaneBomber", "SeaplaneFighter", "LargeFlyingBoat")

/** 艦上機 */
const CarrierBasedAircraft = categoryIn(
  "CarrierBasedFighterAircraft",
  "CarrierBasedDiveBomber",
  "CarrierBasedTorpedoBomber",
  "CarrierBasedReconnaissanceAircraft"
)

/** 噴式機 */
const JetPoweredAircraft = categoryIn(
  "JetPoweredFighter",
  "JetPoweredFighterBomber",
  "JetPoweredTorpedoBomber",
  "JetPoweredReconnaissanceAircraft"
)

/** 陸上機 */
const LandBasedAircraft = categoryIn("LandBasedAttackAircraft", "LandBasedFighter", "LandBasedReconnaissanceAircraft")

/** 戦闘機 */
const Fighter = categoryIn("CarrierBasedFighterAircraft", "SeaplaneFighter", "LandBasedFighter", "JetPoweredFighter")

/** 爆撃機 */
const DiveBomber = categoryIn("CarrierBasedDiveBomber", "SeaplaneBomber", "JetPoweredFighterBomber")

/** 攻撃機 */
const TorpedoBomber = categoryIn("CarrierBasedTorpedoBomber", "JetPoweredTorpedoBomber", "LandBasedAttackAircraft")

/** 偵察機 */
const ReconnaissanceAircraft = categoryIn(
  "CarrierBasedReconnaissanceAircraft",
  "ReconnaissanceSeaplane",
  "LargeFlyingBoat",
  "JetPoweredReconnaissanceAircraft",
  "LandBasedReconnaissanceAircraft"
)

/** 航空機 */
const Aircraft = or(
  Seaplane,
  CarrierBasedAircraft,
  JetPoweredAircraft,
  LandBasedAircraft,
  categoryIn("AntiSubmarinePatrolAircraft", "Autogyro")
)

/** 爆戦 */
const FighterBomber = and(categoryIn("CarrierBasedDiveBomber"), (gear) => gear.antiAir >= 4)

/** 対地艦爆 */
const AntiInstallationBomber = gearIdIn(
  GearId["零式艦戦62型(爆戦)"],
  GearId["Ju87C改"],
  GearId["Ju87C改二(KMX搭載機)"],
  GearId["Ju87C改二(KMX搭載機/熟練)"],
  GearId["試製南山"],
  GearId["F4U-1D"],
  GearId["FM-2"],
  GearId["彗星一二型(六三四空/三号爆弾搭載機)"]
)

const matchers = {
  Abyssal,

  HighAngleMount,
  MainGun,

  Radar,
  SurfaceRadar,
  AirRadar,

  Armor,

  AswGear,
  AswAircraft,

  DepthChargeProjector,
  AdditionalDepthCharge,
  Mortar,

  AntiGroundRocketLauncher,

  Seaplane,
  CarrierBasedAircraft,
  LandBasedAircraft,
  JetPoweredAircraft,
  Aircraft,

  Fighter,
  DiveBomber,
  TorpedoBomber,
  ReconnaissanceAircraft,

  FighterBomber,
  AntiInstallationBomber,
}

export type GearAttribute = keyof typeof matchers

const allAttrs = Object.keys(matchers) as GearAttribute[]

export const createGearAttrs = (data: Required<GearData>): GearAttribute[] =>
  allAttrs.filter((attr) => matchers[attr](data))
