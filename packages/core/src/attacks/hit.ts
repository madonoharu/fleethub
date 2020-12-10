export type HitRateParams = {
  accuracyTerm: number
  evasionTerm: number
  moraleModifier: number

  criticalRateMultiplier: number
  hitRateBonus?: number
  criticalRateBonus?: number
}

export type HitRateDetail = HitRateParams & {
  hitRate: number
  criticalRate: number
  normalRate: number
}

/**
 * @returns 10~96
 */
const calcHitRateBasis = ({ accuracyTerm, evasionTerm, moraleModifier }: HitRateParams) => {
  const value = (accuracyTerm - evasionTerm) * moraleModifier

  if (value < 10) {
    return 10
  }

  if (value > 96) {
    return 96
  }

  return value
}

export const calcHitRate = (params: HitRateParams): HitRateDetail => {
  const { criticalRateMultiplier, hitRateBonus = 0, criticalRateBonus = 0 } = params
  const hitRateBasis = calcHitRateBasis(params)

  const hitPercent = Math.floor(hitRateBasis + 1 + hitRateBonus)
  const criticalPercent = Math.floor(Math.sqrt(hitRateBasis) * criticalRateMultiplier + 1 + criticalRateBonus * 100)

  const hitRate = Math.min(hitPercent / 100, 1)
  const criticalRate = Math.min(criticalPercent / 100, 1)
  const normalRate = hitRate - criticalRate

  return { ...params, hitRate, criticalRate, normalRate }
}

type HitStatus = "Miss" | "Normal" | "Critical"

export const getHitStatus = (rate: Pick<HitRateDetail, "criticalRate" | "hitRate">): HitStatus => {
  const randomNum = Math.random()

  if (randomNum < rate.criticalRate) return "Critical"
  if (randomNum < rate.hitRate) return "Normal"
  return "Miss"
}
