import React from "react"
import styled from "styled-components"
import { Ship, ShipState } from "@fleethub/core"

import { Typography, Button, Tooltip } from "@material-ui/core"
import EditIcon from "@material-ui/icons/Edit"

import { UpdateButton, ClearButton, InfoButton, EditButton } from "../../../components"

import { useModal } from "../../../hooks"
import { Update } from "../../../utils"

import ShipEditor from "./ShipEditor"

const StyledButton = styled(Button)`
  height: 100%;
  min-width: calc(100% - ${24 * 3}px);
  justify-content: flex-start;

  svg {
    font-size: 18px;
  }
`

type Props = {
  ship: Ship
  update: Update<ShipState>
  onRemove?: () => void
}

const ShipHeader: React.FCX<Props> = ({ className, ship, update, onRemove }) => {
  const Modal = useModal()

  return (
    <div className={className}>
      <Tooltip title="ステータスを編集">
        <StyledButton onClick={Modal.show}>
          Lv{ship.level} {ship.name}
          <EditIcon />
        </StyledButton>
      </Tooltip>

      <InfoButton size="small" />
      <UpdateButton size="small" />
      <ClearButton size="small" onClick={onRemove} />

      <Modal>
        <ShipEditor ship={ship} update={update} />
      </Modal>
    </div>
  )
}

export default styled(ShipHeader)`
  display: flex;
  align-items: center;
  height: 24px;

  ${InfoButton} {
    margin-left: auto;
  }
`
