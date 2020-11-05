import { isNonNullable, uniq, atLeastOne, GearId, ShipId } from "@fleethub/utils"

import { Ship } from "../ship"
import { Gear } from "../gear"
import { AntiAirCutin } from "../common"
import { RateMap } from "../utils"

const getPossibleAntiAirCutinIds = (ship: Ship) => {
  const {
    shipId,
    equipment: { count, has },
  } = ship

  const result: number[] = []

  /** 高角砲 */
  const isHighAngleMount = (gear: Gear) => gear.is("HighAngleMount")
  /** 特殊高角砲 */
  const isBuiltinHighAngleMount = (gear: Gear) => isHighAngleMount(gear) && gear.antiAir >= 8
  /** 標準高角砲 */
  const isNormalHighAngleMount = (gear: Gear) => isHighAngleMount(gear) && gear.antiAir < 8

  const isRadar = (gear: Gear) => gear.is("Radar")
  /** 対空電探 */
  const isAirRadar = (gear: Gear) => gear.is("AirRadar")

  const isAAGun = (gear: Gear) => gear.categoryIn("AntiAirGun")

  /** 特殊機銃 */
  const isCDMG = (gear: Gear) => isAAGun(gear) && gear.antiAir >= 9

  /** 標準機銃 */
  const isNormalAAGun = (gear: Gear) => isAAGun(gear) && gear.antiAir >= 3 && gear.antiAir < 9

  const isAAShell = (gear: Gear) => gear.categoryIn("AntiAirShell")

  /** 高射装置 */
  const isAAFD = (gear: Gear) => gear.categoryIn("AntiAirFireDirector")

  const isLargeCaliberMainGun = (gear: Gear) => gear.categoryIn("LargeCaliberMainGun")

  // 秋月型 かつ 高角砲を装備
  if (ship.shipClassIn("AkizukiClass") && has(isHighAngleMount)) {
    // 高角砲を2つ以上装備 かつ 電探を装備
    if (count(isHighAngleMount) >= 2 && has(isRadar)) result.push(1)

    // 電探を装備
    if (has(isRadar)) result.push(2)

    // 高角砲を2つ以上装備
    if (count(isHighAngleMount) >= 2) result.push(3)

    return result
  }

  if (ship.shipClassIn("FletcherClass")) {
    const mk30KaiCount = count(GearId["5inch単装砲 Mk.30改"])
    const mk30Count = count(GearId["5inch単装砲 Mk.30"]) + mk30KaiCount
    const gfcsCount = count(GearId["5inch単装砲 Mk.30改+GFCS Mk.37"])

    // 5inch単装砲 Mk.30改＋GFCS Mk.37 2本
    if (gfcsCount >= 2) result.push(34)

    // 5inch単装砲 Mk.30改＋GFCS Mk.37 & 5inch単装砲 Mk.30(改)
    if (gfcsCount > 0 && mk30Count > 0) result.push(35)

    // Mk.30(改) 2本
    if (mk30Count >= 2 && has(GearId["GFCS Mk.37"])) result.push(36)

    // Mk.30改 2本
    if (mk30KaiCount >= 2) result.push(37)
  }

  const gfcs5inchCount = count(GearId["GFCS Mk.37+5inch連装両用砲(集中配備)"])
  const atlantaGunCount = count(GearId["5inch連装両用砲(集中配備)"]) + gfcs5inchCount
  if (ship.shipClassIn("AtlantaClass") && atlantaGunCount >= 2) {
    if (gfcs5inchCount >= 1) result.push(39)
    if (has(GearId["GFCS Mk.37"])) result.push(40)
    result.push(41)
  }

  // 摩耶改二 かつ 高角砲を装備 かつ 特殊機銃を装備
  if (shipId === ShipId["摩耶改二"] && has(isHighAngleMount) && has(isCDMG)) {
    if (has(isAirRadar)) result.push(10)
    result.push(11)
  }

  // 五十鈴改二 かつ 高角砲を装備 かつ 対空機銃を装備
  if (shipId === ShipId["五十鈴改二"] && has(isHighAngleMount) && has(isAAGun)) {
    if (has(isAirRadar)) result.push(14)

    result.push(15)
  }

  // 霞改二乙 かつ 高角砲を装備 かつ 対空機銃を装備
  if (shipId === ShipId["霞改二乙"] && has(isHighAngleMount) && has(isAAGun)) {
    if (has(isAirRadar)) {
      result.push(16)
    }
    result.push(17)
  }

  if (shipId === ShipId["夕張改二"] && has(isHighAngleMount) && has(isAAShell) && has(isAirRadar)) {
    result.push(16)
  }

  // 鬼怒改二 かつ 特殊機銃を装備 かつ 標準高角砲を装備
  if (shipId === ShipId["鬼怒改二"] && has(isCDMG) && has(isNormalHighAngleMount)) {
    result.push(19)
  }

  // 由良改二 かつ 高角砲を装備 かつ 対空電探
  if (shipId === ShipId["由良改二"] && has(isHighAngleMount) && has(isAirRadar)) {
    result.push(21)
  }

  // 伊勢型航空戦艦 かつ 12cm30連装噴進砲改二を装備 かつ 対空強化弾(三式弾)を装備 かつ 対空電探を装備
  if (
    ship.shipClassIn("IseClass") &&
    ship.shipTypeIn("BBV") &&
    has(GearId["12cm30連装噴進砲改二"]) &&
    has(isAAShell) &&
    has(isAirRadar)
  ) {
    result.push(25)
  }

  // 高射装置を装備 かつ 大口径主砲を装備 かつ 対空強化弾(三式弾)を装備 かつ 対空電探を装備
  if (has(isAAFD) && has(isLargeCaliberMainGun) && has(isAAShell) && has(isAirRadar)) {
    result.push(4)
  }

  // 特殊高角砲を2つ以上装備 かつ 対空電探を装備
  if (count(isBuiltinHighAngleMount) >= 2 && has(isAirRadar)) {
    result.push(5)
  }

  // 高射装置を装備 かつ 大口径主砲を装備 かつ 対空強化弾(三式弾)を装備
  if (has(isAAFD) && has(isLargeCaliberMainGun) && has(isAAShell)) {
    result.push(6)
  }

  // 特殊高角砲を装備 かつ 対空電探を装備
  if (has(isBuiltinHighAngleMount) && has(isAirRadar)) {
    result.push(8)
  }

  // 高射装置を装備かつ 高角砲を装備 かつ 対空電探を装備
  if (has(isAAFD) && has(isHighAngleMount) && has(isAirRadar)) {
    result.push(7)
  }

  // 武蔵改二 かつ 10cm連装高角砲改+増設機銃 かつ 対空電探を装備
  if (shipId === ShipId["武蔵改二"] && has(GearId["10cm連装高角砲改+増設機銃"]) && has(isRadar)) {
    result.push(26)
  }

  // (伊勢型航空戦艦|武蔵改|武蔵改二) かつ 12㎝30連装噴進砲改二を装備 かつ 対空電探を装備
  if (
    (ship.shipClassIn("IseClass") && ship.shipTypeIn("BBV")) ||
    shipId === ShipId["武蔵改"] ||
    shipId === ShipId["武蔵改二"]
  ) {
    if (has(GearId["12cm30連装噴進砲改二"]) && has(isAirRadar)) {
      result.push(28)
    }
  }

  // (浜風乙改 または 磯風乙改) かつ 高角砲を装備 かつ 対空電探を装備
  if (shipId === ShipId["浜風乙改"] || shipId === ShipId["磯風乙改"]) {
    if (has(isHighAngleMount) && has(isAirRadar)) {
      result.push(29)
    }
  }

  // 高射装置を装備 かつ 高角砲を装備
  if (has(isAAFD) && has(isHighAngleMount)) {
    result.push(9)
  }

  // Gotland改以上 かつ 高角砲を装備 かつ 対空4以上の対空機銃を装備
  if (
    [ShipId["Gotland改"], ShipId["Gotland andra"]].includes(ship.shipId) &&
    has(isHighAngleMount) &&
    has((gear) => gear.categoryIn("AntiAirGun") && gear.antiAir >= 4)
  ) {
    result.push(33)
  }

  // 特殊機銃を装備 かつ 対空電探を装備 かつ 標準機銃または特殊機銃を装備
  if (has(isCDMG) && has(isAirRadar) && count((gear) => gear.categoryIn("AntiAirGun") && gear.antiAir >= 3) >= 2) {
    result.push(12)
  }

  // 特殊高角砲を装備 かつ 特殊機銃を装備 かつ 対空電探を装備
  if (has(isBuiltinHighAngleMount) && has(isCDMG) && has(isAirRadar)) {
    result.push(13)
  }

  // 皐月改二 かつ 特殊機銃を装備
  if (shipId === ShipId["皐月改二"] && has(isCDMG)) {
    result.push(18)
  }

  // 鬼怒改二 かつ 特殊機銃を装備
  if (shipId === ShipId["鬼怒改二"] && has(isCDMG)) {
    result.push(20)
  }

  // 文月改二 かつ 特殊機銃を装備
  if (shipId === ShipId["文月改二"] && has(isCDMG)) {
    result.push(22)
  }

  // (UIT-25 または 伊504) かつ 標準機銃を装備
  if ([ShipId["UIT-25"], ShipId["伊504"]].includes(shipId) && has(isNormalAAGun)) {
    result.push(23)
  }

  // (龍田改二|天龍改二) かつ 高角砲を装備 かつ 標準機銃を装備
  if ([ShipId["龍田改二"], ShipId["天龍改二"]].includes(shipId) && has(isHighAngleMount) && has(isNormalAAGun)) {
    result.push(24)
  }

  // (天龍改二|Gotland改) かつ 高角砲を3つ以上装備
  if ([ShipId["天龍改二"], ShipId["Gotland改"]].includes(shipId) && count(isHighAngleMount) >= 3) {
    result.push(30)
  }

  // 天龍改二 かつ 高角砲を2つ以上装備
  if (shipId === ShipId["天龍改二"] && count(isHighAngleMount) >= 2) {
    result.push(31)
  }

  if (ship.is("RoyalNavy") || (ship.shipClassIn("KongouClass") && ship.is("Kai2"))) {
    if (
      count(GearId["20連装7inch UP Rocket Launchers"]) >= 2 ||
      (has(GearId["20連装7inch UP Rocket Launchers"]) && has(GearId["QF 2ポンド8連装ポンポン砲"])) ||
      (has(GearId["16inch Mk.I三連装砲改+FCR type284"]) && has(GearId["QF 2ポンド8連装ポンポン砲"]))
    ) {
      result.push(32)
    }
  }

  return result
}

const getPossibleAntiAirCutins = (ship: Ship) =>
  getPossibleAntiAirCutinIds(ship).map(AntiAirCutin.fromId).filter(isNonNullable)

export const getShipAntiAirCutinChance = (ship: Ship) => {
  const cis = getPossibleAntiAirCutins(ship)

  const specialCis = cis.filter((ci) => ci.isSpecial)
  const normalCis = cis.filter((ci) => !ci.isSpecial)

  const rateMap = new RateMap<AntiAirCutin>()
  specialCis.forEach((ci) => {
    const rate = rateMap.complement * ci.intrinsicRate
    rateMap.set(ci, rate)
  })

  const totalSpecialAaciRate = rateMap.total

  normalCis.reduce((prevIntrinsicRate, ci) => {
    let rate = ci.intrinsicRate - prevIntrinsicRate
    if (rate < 0) {
      rateMap.set(ci, 0)
      return prevIntrinsicRate
    }

    if (totalSpecialAaciRate > 0) {
      rate = (1 - totalSpecialAaciRate) * rate
    }

    rateMap.set(ci, rate)
    return ci.intrinsicRate
  }, 0)

  return rateMap
}

export const composeAntiAirCutinChances = (chances: Array<RateMap<AntiAirCutin>>) => {
  const cis = uniq(
    chances
      .flatMap((rateMap) => rateMap.toArray())
      .filter(([ci, rate]) => rate > 0)
      .map(([ci]) => ci)
  ).sort((a, b) => b.id - a.id)

  const calcFleetRate = (target: AntiAirCutin) => {
    const highIdRates = chances.map((rateMap) => rateMap.sumBy((rate, ci) => (ci.id > target.id ? rate : 0)))
    const highIdRate = atLeastOne(highIdRates)

    const lowIdRate = chances
      .map((rateMap) => rateMap.sumBy((rate, ci) => (ci.id >= target.id ? rate : 0)))
      .reduce((acc, cur) => acc * (1 - cur), 1)

    return 1 - (highIdRate + lowIdRate)
  }

  const result = new RateMap<AntiAirCutin>()

  cis.forEach((ci) => {
    const rate = calcFleetRate(ci)
    result.set(ci, rate)
  })

  return result
}
