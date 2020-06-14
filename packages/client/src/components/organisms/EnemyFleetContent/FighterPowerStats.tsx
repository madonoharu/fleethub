import React from "react"
import styled from "styled-components"
import { AirState } from "@fleethub/core"

import { Tooltip, Typography } from "@material-ui/core"

const FighterPowerValue: React.FCX<{ airState: AirState; value: number }> = ({ className, airState, value }) => {
  return (
    <Tooltip title={airState}>
      <span className={className}>{value}</span>
    </Tooltip>
  )
}

const StyledFighterPowerValue = styled(FighterPowerValue)`
  color: ${({ theme, airState }) => theme.kc.palette.airState[airState]};
`

const getMinFighterPowers = (fp: number) => {
  return {
    [AirState.AirSupremacy]: Math.ceil(3 * fp),
    [AirState.AirSuperiority]: Math.ceil(1.5 * fp),
    [AirState.AirParity]: Math.floor((2 / 3) * fp) + 1,
    [AirState.AirDenial]: Math.floor((1 / 3) * fp) + 1,
  }
}

type Props = {
  value: number
  label?: string
}

const FighterPowerStats: React.FCX<Props> = ({ className, value, label }) => {
  let minFpsElement: React.ReactNode = null
  if (value > 0) {
    const minFps = getMinFighterPowers(value)
    minFpsElement = (
      <>
        <span>(</span>
        <StyledFighterPowerValue airState={AirState.AirSupremacy} value={minFps[AirState.AirSupremacy]} />
        <span>/</span>
        <StyledFighterPowerValue airState={AirState.AirSuperiority} value={minFps[AirState.AirSuperiority]} />
        <span>/</span>
        <StyledFighterPowerValue airState={AirState.AirParity} value={minFps[AirState.AirParity]} />
        <span>/</span>
        <StyledFighterPowerValue airState={AirState.AirDenial} value={minFps[AirState.AirDenial]} />
        <span>)</span>
      </>
    )
  }

  return (
    <Typography className={className} component="div">
      {label && <span>{label}</span>}
      <span>{value}</span>
      {minFpsElement}
    </Typography>
  )
}

export default styled(FighterPowerStats)`
  > span {
    margin: 2px;
  }
`
