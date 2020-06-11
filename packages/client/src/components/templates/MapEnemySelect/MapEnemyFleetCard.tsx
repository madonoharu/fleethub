import React from "react"
import styled from "styled-components"
import { PlanState, FleetState, ShipKey } from "@fleethub/core"
import { MapEnemyFleet } from "@fleethub/data"

import { Container, Paper, Button, Typography } from "@material-ui/core"

import { ShipBanner, Flexbox } from "../../../components"
import { useFhSystem } from "../../../hooks"

import FighterPowerStats from "./FighterPowerStats"

const getFormationName = (form: number) => {
  const dict: Record<number, string | undefined> = {
    [1]: "単縦陣",
    [2]: "複縦陣",
    [3]: "輪形陣",
    [4]: "梯形陣",
    [5]: "単横陣",
    [6]: "警戒陣",
    [11]: "第一警戒航行序列",
    [12]: "第二警戒航行序列",
    [13]: "第三警戒航行序列",
    [14]: "第四警戒航行序列",
  }

  return dict[form] || "不明"
}

const FormationButton: React.FC<{ formation: number; onClick?: () => void }> = ({ formation, onClick }) => {
  const name = getFormationName(formation)
  return <Button onClick={onClick}>{name}</Button>
}

export type EnemyFleetState = Pick<MapEnemyFleet, "main" | "escort"> & {
  formation: number
}

type Props = {
  enemyFleet: MapEnemyFleet
  visibleAlbPower?: boolean
  onSelect?: (enemy: EnemyFleetState) => void
}

const MapEnemyFleetCard: React.FCX<Props> = ({ className, enemyFleet, visibleAlbPower, onSelect }) => {
  const { main, escort, formations } = enemyFleet

  const { createPlanByMapEnemy } = useFhSystem()
  const plan = createPlanByMapEnemy(enemyFleet)

  const combinedFp = plan.calcFleetFighterPower(true)
  const albFp = plan.calcFleetFighterPower(true, true)

  return (
    <Paper className={className}>
      <Flexbox>
        <FighterPowerStats label="制空" value={combinedFp} />
        {visibleAlbPower && <FighterPowerStats label="基地戦" value={albFp} />}
      </Flexbox>

      <div>
        {main.map((shipId, index) => (
          <ShipBanner key={index} shipId={shipId} />
        ))}
      </div>
      <div>
        {escort?.map((shipId, index) => (
          <ShipBanner key={index} shipId={shipId} />
        ))}
      </div>
      {formations.map((formation) => (
        <FormationButton
          key={formation}
          formation={formation}
          onClick={() => onSelect?.({ main, escort, formation })}
        />
      ))}
    </Paper>
  )
}

export default MapEnemyFleetCard
