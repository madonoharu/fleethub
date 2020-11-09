import React from "react"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { AntiAirCutin } from "@fleethub/core"

import { Chip, Tooltip, Typography } from "@material-ui/core"
import { LabeledValue } from "../../atoms"

type Props = {
  antiAirCutin: AntiAirCutin
}

const AntiAirCutinChip: React.FCX<Props> = ({ className, antiAirCutin }) => (
  <Tooltip
    title={
      <>
        <Typography variant="subtitle2">{antiAirCutin.name}</Typography>
        <LabeledValue label="固定" value={antiAirCutin.minimumBonus} />
        <LabeledValue label="変動" value={antiAirCutin.fixedAirDefenseModifier} />
        <LabeledValue label="発動定数(推測)" value={antiAirCutin.baseRate} />
      </>
    }
  >
    <Chip className={className} label={antiAirCutin.name} size="small" variant="outlined" />
  </Tooltip>
)

export default styled(AntiAirCutinChip)(
  ({ theme }) => css`
    width: 48px;
    border-radius: 4px;
    color: ${theme.colors.antiAir};
    border-color: ${theme.colors.antiAir};
  `
)
