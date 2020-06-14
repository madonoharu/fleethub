import React from "react"
import styled from "styled-components"
import { EnemyFleet } from "@fleethub/core"

import { Container, Paper, Button, Typography } from "@material-ui/core"

import { ShipBanner, Flexbox } from "../../../components"

import FighterPowerStats from "./FighterPowerStats"

type Props = {
  enemy: EnemyFleet
  visibleAlbFp?: boolean
}

const EnemyFleetContent: React.FCX<Props> = ({ className, enemy, visibleAlbFp }) => {
  return (
    <div className={className}>
      <Flexbox>
        <FighterPowerStats label="制空" value={enemy.fighterPower} />
        {visibleAlbFp && <FighterPowerStats label="基地戦" value={enemy.antiLbFighterPower} />}
      </Flexbox>

      <div>
        {enemy.main.ships.map((ship, index) => (
          <ShipBanner key={index} shipId={ship.shipId} />
        ))}
      </div>
      <div>
        {enemy.escort?.ships.map((ship, index) => (
          <ShipBanner key={index} shipId={ship.shipId} />
        ))}
      </div>
    </div>
  )
}

export default EnemyFleetContent
