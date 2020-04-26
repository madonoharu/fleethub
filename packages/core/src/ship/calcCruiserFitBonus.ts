/**
 * 巡洋艦砲フィット補正
 *
 * 軽巡軽量砲補正と伊重巡フィット砲補正
 * @see https://github.com/Nishisonic/UnexpectedDamage/blob/develop/攻撃力資料/キャップ前攻撃力.md#軽巡軽量砲補正
 * @see https://github.com/Nishisonic/UnexpectedDamage/blob/develop/攻撃力資料/キャップ前攻撃力.md#伊重巡フィット砲補正
 */
const calcCruiserFitBonus = (params: {
  isLightCruiserClass: boolean
  singleGunCount: number
  twinGunCount: number
  isZaraClass: boolean
  zaraGunCount: number
}) => {
  const { isLightCruiserClass, isZaraClass, singleGunCount, twinGunCount, zaraGunCount } = params

  if (isLightCruiserClass) {
    return Math.sqrt(singleGunCount) + 2 * Math.sqrt(twinGunCount)
  }
  if (isZaraClass) {
    return Math.sqrt(zaraGunCount)
  }
  return 0
}

export default calcCruiserFitBonus
