import React from "react"
import styled from "styled-components"

import { Button } from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"

type Props = {
  onClick?: () => void
}

const AddGearButton: React.FCX<Props> = ({ className, onClick }) => {
  return (
    <Button className={className} onClick={onClick}>
      <AddIcon fontSize="small" />
    </Button>
  )
}

export default styled(AddGearButton)`
  height: 100%;
  width: 100%;
  padding: 0;
  color: ${(props) => props.theme.palette.action.disabled};

  :hover {
    transition: 250ms;
    color: ${(props) => props.theme.palette.action.active};
  }
`
