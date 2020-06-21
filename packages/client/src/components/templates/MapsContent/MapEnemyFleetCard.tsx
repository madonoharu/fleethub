import React from "react"
import styled from "styled-components"
import { EnemyFleetState } from "@fleethub/core"
import { MapEnemyFleet } from "@fleethub/data"

import { Container, Paper, Button, Typography } from "@material-ui/core"

import { EnemyFleetContent } from "../.."
import { useFhSystem } from "../../../hooks"

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

type Props = {
  mapEnemyFleet: MapEnemyFleet
  visibleAlbFp?: boolean
  onSelect?: (enemy: EnemyFleetState) => void
}

const MapEnemyFleetCard: React.FCX<Props> = ({ className, mapEnemyFleet, visibleAlbFp, onSelect }) => {
  const { createEnemyFleetByMapEnemy } = useFhSystem()
  const enemyFleet = createEnemyFleetByMapEnemy(mapEnemyFleet)

  return (
    <Paper className={className}>
      <EnemyFleetContent enemy={enemyFleet} visibleAlbFp={visibleAlbFp} />
      {mapEnemyFleet.formations.map((formation) => (
        <FormationButton key={formation} formation={formation} onClick={() => onSelect?.(enemyFleet.state)} />
      ))}
    </Paper>
  )
}

export default MapEnemyFleetCard
