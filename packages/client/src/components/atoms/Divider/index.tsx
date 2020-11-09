import React from "react"
import styled from "@emotion/styled"

import { Typography, Divider as MuiDivider, DividerProps } from "@material-ui/core"

const StyledDivider = styled(MuiDivider)`
  flex-grow: 1;
  margin-left: 8px;
`

type Props = DividerProps & {
  label: React.ReactNode
}

const Divider: React.FCX<Props> = ({ className, label, ...muiProps }) => {
  return (
    <div className={className}>
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
      <StyledDivider {...muiProps} />
    </div>
  )
}

export default styled(Divider)`
  display: flex;
  align-items: center;
  width: 100%;
`
