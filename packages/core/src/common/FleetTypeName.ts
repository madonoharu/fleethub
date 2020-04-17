/**
 * 艦隊の種類
 * 通常, 空母機動部隊, 水上打撃部隊, 輸送護衛部隊, 敵連合
 */
enum FleetTypeName {
  /** 通常 */
  Single = "Single",

  /** 空母機動部隊 */
  CarrierTaskForce = "CarrierTaskForce",

  /** 水上打撃部隊 */
  SurfaceTaskForce = "SurfaceTaskForce",

  /** 輸送護衛部隊 */
  TransportEscort = "TransportEscort",

  /** 敵連合 */
  Combined = "Combined",
}

export default FleetTypeName
