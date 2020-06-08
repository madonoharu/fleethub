import React from "react"
import { MapEnemyFleet } from "@fleethub/data"

import { Container, Paper, Button } from "@material-ui/core"

import { ShipBanner } from "../../../components"
import { useFhSystem } from "../../../hooks"
import { PlanState, FleetState, ShipKey } from "@fleethub/core"

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

const mapEnemyFleetToPlan = (mapEnemyFleet: MapEnemyFleet): PlanState => {
  const f1: FleetState = {}
  const f2: FleetState = {}

  mapEnemyFleet.main.forEach((shipId, index) => {
    f1[`s${index + 1}` as ShipKey] = { shipId }
  })

  mapEnemyFleet.escort?.forEach((shipId, index) => {
    f2[`s${index + 1}` as ShipKey] = { shipId }
  })

  return { f1, f2 }
}

type Props = {
  enemyFleet: MapEnemyFleet
}

const MapEnemyFleetCard: React.FCX<Props> = ({ className, enemyFleet }) => {
  const { main, escort, formations } = enemyFleet
  const plan = useFhSystem().createPlan(mapEnemyFleetToPlan(enemyFleet))
  const fp = plan.fleetEntries
    .map(([key, fleet]) => fleet)
    .reduce((value, fleet) => value + fleet.calcFighterPower(false), 0)

  return (
    <Paper className={className}>
      {fp}
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
