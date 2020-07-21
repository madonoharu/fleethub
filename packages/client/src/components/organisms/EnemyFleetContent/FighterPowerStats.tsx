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
  color: ${({ theme, airState }) => theme.colors[airState]};
`

const getMinFighterPowers = (fp: number) => {
  return {
    AirSupremacy: Math.ceil(3 * fp),
    AirSuperiority: Math.ceil(1.5 * fp),
    AirParity: Math.floor((2 / 3) * fp) + 1,
    AirDenial: Math.floor((1 / 3) * fp) + 1,
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
        <StyledFighterPowerValue airState={"AirSupremacy"} value={minFps.AirSupremacy} />
        <span>/</span>
        <StyledFighterPowerValue airState={"AirSuperiority"} value={minFps.AirSuperiority} />
        <span>/</span>
        <StyledFighterPowerValue airState={"AirParity"} value={minFps.AirParity} />
        <span>/</span>
        <StyledFighterPowerValue airState={"AirDenial"} value={minFps.AirDenial} />
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
