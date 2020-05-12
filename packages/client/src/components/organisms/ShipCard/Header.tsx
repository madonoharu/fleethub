import React from "react"
import styled from "styled-components"

import Typography from "@material-ui/core/Typography"

import { UpdateButton, ClearButton, InfoButton } from "../../../components"

import LevelButton from "./LevelButton"

type Props = {
  name: string
  level: number
  onLevelChange: (level: number) => void
  onRemove?: () => void
}

const Component: React.FCX<Props> = ({ className, name, level, onLevelChange, onRemove }) => {
  return (
    <div className={className}>
      <LevelButton value={level} onChange={onLevelChange} />
      <Typography variant="body2" noWrap>
        {name}
      </Typography>
      <InfoButton size="small" />
      <UpdateButton size="small" />
      <ClearButton size="small" onClick={onRemove} />
    </div>
  )
}

export default styled(Component)`
  display: flex;
  align-items: center;

  ${LevelButton} {
    height: 24px;
  }
  ${InfoButton} {
    margin-left: auto;
  }
`
