import React from "react"
import styled from "styled-components"

import Typography from "@material-ui/core/Typography"

import { UpdateButton, ClearButton, InfoButton } from "../../../components"

import LevelButton from "./LevelButton"

export const IconButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
`

type Props = {
  name: string
  level: number
  onLevelChange: (level: number) => void
  onRemove: () => void
}

const Component: React.FCX<Props> = ({ className, name, level, onLevelChange, onRemove }) => {
  return (
    <div className={className}>
      <LevelButton value={level} onChange={onLevelChange} />
      <Typography variant="subtitle2" noWrap>
        {name}
      </Typography>
      <IconButtonGroup>
        <InfoButton size="small" />
        <UpdateButton size="small" />
        <ClearButton size="small" onClick={onRemove} />
      </IconButtonGroup>
    </div>
  )
}

export default styled(Component)`
  display: flex;
  align-items: center;

  ${LevelButton} {
    height: 24px;
  }
  ${IconButtonGroup} {
    margin-left: auto;
  }
`
