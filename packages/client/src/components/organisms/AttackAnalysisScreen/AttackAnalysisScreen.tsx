import React from "react"
import { css } from "@emotion/react"
import { BattleContextImpl, ShellingImpl, Ship } from "@fleethub/core"
import { Tooltip, Typography } from "@material-ui/core"

import { toPercent } from "../../../utils"
import HitRateDetailScreen from "./HitRateDetailScreen"
import DamageDistributionChart from "./DamageDistributionChart"
import AttackResultChart from "./AttackResultChart"

type AttackAnalysisScreenProps = {
  ctx: BattleContextImpl
  attacker: Ship
  defender: Ship
}

const AttackAnalysisScreen: React.FCX<AttackAnalysisScreenProps> = ({ ctx, attacker, defender }) => {
  const spAttackNames = ctx
    .calcShellingAbility(attacker)
    .rates.toArray()
    .map(([sp]) => sp.name)

  const shellingParams = ctx.getShellingParams(attacker, defender)

  const shellingAnalisis = new ShellingImpl(shellingParams).analyze()
  const normalDamageAnalysis = shellingAnalisis.normalDamage.analyze()
  const criticalDamageAnalysis = shellingAnalisis.criticalDamage.analyze()

  return (
    <div>
      <Typography>砲撃戦</Typography>

      <Typography>単発</Typography>
      <Typography
        css={css`
          display: grid;
          grid-template-columns: max-content max-content;
          font-size: 0.875rem;

          > span:nth-of-type(2n) {
            margin-left: 8px;
            text-align: right;
          }
        `}
      >
        <span>命中率</span>
        <Tooltip title={<HitRateDetailScreen detail={shellingAnalisis.hitRateDetail} />}>
          <span>{toPercent(shellingAnalisis.hitRateDetail.hitRate)}</span>
        </Tooltip>
        <span>クリティカル率</span>
        <span>{toPercent(shellingAnalisis.hitRateDetail.criticalRate)}</span>
        <span>ダメージ</span>
        <span>
          {normalDamageAnalysis.min} ~ {normalDamageAnalysis.max}
        </span>
        <span>クリティカルダメージ</span>
        <span>
          {criticalDamageAnalysis.min} ~ {criticalDamageAnalysis.max}
        </span>
      </Typography>

      <AttackResultChart attackResultStates={shellingAnalisis.attackResultStates} />
    </div>
  )
}

export default AttackAnalysisScreen
