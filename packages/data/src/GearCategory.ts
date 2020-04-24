/**
 * マスターデータの装備カテゴリ
 * 大口径主砲(II)などのII系統はここでは扱わない
 */
export enum GearCategory {
  /** 小口径主砲 */
  SmallCaliberMainGun = 1,

  /** 中口径主砲 */
  MediumCaliberMainGun = 2,

  /** 大口径主砲 */
  LargeCaliberMainGun = 3,

  /** 副砲 */
  SecondaryGun = 4,

  /** 魚雷 */
  Torpedo = 5,

  /** 艦上戦闘機 */
  CbFighter = 6,

  /** 艦上爆撃機 */
  CbDiveBomber = 7,

  /** 艦上攻撃機 */
  CbTorpedoBomber = 8,

  /** 艦上偵察機 */
  CbRecon = 9,

  /** 水上偵察機 */
  ReconSeaplane = 10,

  /** 水上爆撃機 */
  SeaplaneBomber = 11,

  /** 小型電探 */
  SmallRadar = 12,

  /** 大型電探 */
  LargeRadar = 13,

  /** ソナー */
  Sonar = 14,

  /** 爆雷 */
  DepthCharge = 15,

  /** 追加装甲 */
  ExtraArmor = 16,

  /** 機関部強化 */
  EngineImprovement = 17,

  /** 対空強化弾 */
  AntiAirShell = 18,

  /** 対艦強化弾 */
  ApShell = 19,

  /** VT信管 */
  VTFuze = 20,

  /** 対空機銃 */
  AntiAirGun = 21,

  /** 特殊潜航艇 */
  MidgetSubmarine = 22,

  /** 応急修理要員 */
  EmergencyRepairPersonnel = 23,

  /** 上陸用舟艇 */
  LandingCraft = 24,

  /** オートジャイロ */
  Autogyro = 25,

  /** 対潜哨戒機 */
  AntiSubmarinePatrolAircraft = 26,

  /** 追加装甲（中型) */
  MediumExtraArmor = 27,

  /** 追加装甲（大型) */
  LargeExtraArmor = 28,

  /** 探照灯 */
  Searchlight = 29,

  /** 簡易輸送部材 */
  SupplyTransportContainer = 30,

  /** 艦艇修理施設 */
  ShipRepairFacility = 31,

  /** 潜水艦魚雷 */
  SubmarineTorpedo = 32,

  /** 照明弾 */
  StarShell = 33,

  /** 司令部施設 */
  CommandFacility = 34,

  /** 航空要員 */
  AviationPersonnel = 35,

  /** 高射装置 */
  AntiAirFireDirector = 36,

  /** 対地装備 */
  AntiGroundEquipment = 37,

  /** 水上艦要員 */
  SurfaceShipPersonnel = 39,

  /** 大型ソナー */
  LargeSonar = 40,

  /** 大型飛行艇 */
  LargeFlyingBoat = 41,

  /** 大型探照灯 */
  LargeSearchlight = 42,

  /** 戦闘糧食 */
  CombatRation = 43,

  /** 補給物資 */
  Supplies = 44,

  /** 水上戦闘機 */
  SeaplaneFighter = 45,

  /** 特型内火艇 */
  SpecialAmphibiousTank = 46,

  /** 陸上攻撃機 */
  LbAttacker = 47,

  /** 局地戦闘機 */
  LbFighter = 48,

  /** 陸上偵察機 */
  LbRecon = 49,

  /** 輸送機材 */
  TransportationMaterial = 50,

  /** 潜水艦装備 */
  SubmarineEquipment = 51,

  /** 噴式戦闘機 */
  JetFighter = 56,

  /** 噴式戦闘爆撃機 */
  JetFighterBomber = 57,

  /** 噴式攻撃機 */
  JetTorpedoBomber = 58,

  /** 噴式索敵機 */
  JetRecon = 59,
}

/** 特殊装備カテゴリ */
export enum GearCategory2 {
  /** 大口径主砲(II) */
  LargeCaliberMainGun2 = 38,

  /** 大型電探(II) */
  LargeRadar2 = 93,

  /** 艦上偵察機(II) */
  CbRecon2 = 94,
}

export type GearCategoryKey = keyof typeof GearCategory
