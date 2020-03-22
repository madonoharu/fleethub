/**
 * 戦闘種別
 */
enum BattleType {
  /** 通常戦 */
  NormalBattle = "NormalBattle",

  /** 夜戦 */
  NightBattle = "NightBattle",

  /** 払暁戦 */
  NightToDayBattle = "NightToDayBattle",

  /** 航空戦 例:1-6 */
  AerialBattle = "AerialBattle",

  /** 長距離空襲戦 */
  AirDefenseBattle = "AirDefenseBattle"
}

export default BattleType
