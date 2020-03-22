/** 艦種Id */
export enum ShipType {
  /** 海防艦 */
  CoastalDefenseShip = 1,

  /** 駆逐艦 */
  Destroyer = 2,

  /** 軽巡洋艦 */
  LightCruiser = 3,

  /** 重雷装巡洋艦 */
  TorpedoCruiser = 4,

  /** 重巡洋艦 */
  HeavyCruiser = 5,

  /** 航空巡洋艦  */
  AviationCruiser = 6,

  /** 軽空母 */
  LightAircraftCarrier = 7,

  /** 巡洋戦艦 */
  Battlecruiser = 8,

  /** 戦艦 */
  Battleship = 9,

  /** 航空戦艦 */
  AviationBattleship = 10,

  /** 正規空母 */
  AircraftCarrier = 11,

  /** 超弩級戦艦 */
  SuperDreadnoughts = 12,

  /** 潜水艦 */
  Submarine = 13,

  /** 潜水空母 */
  SubmarineAircraftCarrier = 14,

  /** 輸送艦 */
  Transport = 15,

  /** 水上機母艦 */
  SeaplaneTender = 16,

  /** 揚陸艦 */
  AmphibiousAssaultShip = 17,

  /** 装甲空母 */
  ArmoredAircraftCarrier = 18,

  /** 工作艦 */
  RepairShip = 19,

  /** 潜水母艦 */
  SubmarineTender = 20,

  /** 練習巡洋艦 */
  TrainingCruiser = 21,

  /** 補給艦 */
  FleetOiler = 22
}

export type ShipTypeKey = keyof typeof ShipType
