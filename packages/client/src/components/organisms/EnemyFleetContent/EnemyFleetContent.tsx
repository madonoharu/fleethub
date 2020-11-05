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
  const albFp = visibleAlbFp && enemy.antiLbFighterPower
  return (
    <div className={className}>
      <Flexbox>
        <FighterPowerStats label="制空" value={enemy.fighterPower} />
        {albFp ? <FighterPowerStats label="基地戦" value={albFp} /> : null}
      </Flexbox>

      <div>
        {enemy.main.ships.map((ship, index) => (
          <ShipBanner key={index} publicId={ship.banner} />
        ))}
      </div>
      <div>
        {enemy.escort?.ships.map((ship, index) => (
          <ShipBanner key={index} publicId={ship.banner} />
        ))}
      </div>
    </div>
  )
}

export default EnemyFleetContent
