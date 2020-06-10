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

type Props = {
  enemyFleet: MapEnemyFleet
  visibleAlbPower?: boolean
}

const MapEnemyFleetCard: React.FCX<Props> = ({ className, enemyFleet, visibleAlbPower }) => {
  const { main, escort, formations } = enemyFleet
  const { getAbyssalShipState, createPlan } = useFhSystem()

  const mapEnemyFleetToPlan = (mapEnemyFleet: MapEnemyFleet) => {
    const f1: FleetState = {}
    const f2: FleetState = {}

    mapEnemyFleet.main.forEach((shipId, index) => {
      f1[`s${index + 1}` as ShipKey] = getAbyssalShipState(shipId)
    })

    mapEnemyFleet.escort?.forEach((shipId, index) => {
      f2[`s${index + 1}` as ShipKey] = getAbyssalShipState(shipId)
    })

    return createPlan({ f1, f2 })
  }

  const plan = mapEnemyFleetToPlan(enemyFleet)

  const combinedFp = plan.calcFleetFighterPower(true)
  const albPower = plan.calcFleetFighterPower(true, true)

  return (
    <Paper className={className}>
      <Flexbox>
        <FighterPowerStats label="制空" value={combinedFp} />
        {visibleAlbPower && <FighterPowerStats label="基地戦" value={albPower} />}
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
      {formations.map((form) => (
        <FormationButton key={form} formation={form} />
      ))}
    </Paper>
  )
}

export default MapEnemyFleetCard
