import React from "react"
import styled from "styled-components"
import { Ship, ShipState } from "@fleethub/core"

import { Button, Tooltip } from "@material-ui/core"
import EditIcon from "@material-ui/icons/Edit"

import { UpdateButton, ClearButton, InfoButton, StarButton } from "../../../components"

import { useModal } from "../../../hooks"
import { Update } from "../../../utils"

import ShipEditor from "./ShipEditor"

const StyledButton = styled(Button)`
  height: 100%;
  min-width: calc(100% - ${24 * 5}px);
  justify-content: flex-start;

  margin-right: 24px;

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
        <StyledButton onClick={Modal.show} endIcon={<EditIcon />}>
          Lv{ship.level} {ship.name}
        </StyledButton>
      </Tooltip>

      <StarButton title="艦娘プリセットに追加" size="small" />
      <InfoButton size="small" />
      <UpdateButton size="small" />
      <ClearButton title="削除" size="small" onClick={onRemove} />

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
