/** 制空 */
enum AirControlState {
  /** 制空権確保 */
  AirSupremacy = 1,
  /** 航空優勢 */
  AirSuperiority = 2,
  /** 制空均衡 */
  AirParity = 0,
  /** 航空劣勢 */
  AirDenial = 3,
  /** 制空権喪失 */
  AirIncapability = 4,
}
export default AirControlState
