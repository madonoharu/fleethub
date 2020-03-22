import React from "react"
import styled from "styled-components"

import Button from "@material-ui/core/Button"
import BuildIcon from "@material-ui/icons/Build"
import AddIcon from "@material-ui/icons/Add"

type Props = {
  className?: string
  slotSize?: number
  onClick?: () => void
}

const Component: React.FC<Props> = ({ className, slotSize, onClick }) => {
  const isExpansionSlot = slotSize === undefined
  const icon = isExpansionSlot ? (
    <BuildIcon fontSize="small" style={{ fontSize: "1rem" }} />
  ) : (
    <>
      <AddIcon fontSize="small" />({slotSize})
    </>
  )

  return (
    <Button className={className} variant="text" onClick={onClick}>
      <AddIcon fontSize="small" />
    </Button>
  )
}

const StyledComponent = styled(Component)`
  height: 100%;
  width: 100%;
  color: ${(props) => props.theme.palette.action.disabled};
  transition: 250ms;
  :hover {
    color: ${(props) => props.theme.palette.action.active};
  }
`

export default StyledComponent
