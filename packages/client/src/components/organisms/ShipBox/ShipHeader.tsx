import React from "react"
import styled from "@emotion/styled"
import { Ship } from "@fleethub/sim"
import { useTranslation } from "react-i18next"

import { Button, Tooltip, Typography } from "@material-ui/core"

import { UpdateButton, ClearButton, InfoButton, StarButton, EditButton } from "../../molecules"

const StyledButton = styled(Button)`
  height: 100%;
  justify-content: flex-start;
  width: 56px;
`

type Props = {
  ship: Ship
  onDetailClick?: () => void
  onRemove?: () => void
}

const ShipHeader: React.FCX<Props> = ({ className, ship, onDetailClick, onRemove }) => {
  const { t } = useTranslation("ships")

  return (
    <div className={className}>
      <Tooltip title="ステータスを編集">
        <StyledButton>Lv{ship.level}</StyledButton>
      </Tooltip>

      <Typography css={{ marginRight: "auto" }} noWrap variant="body2">
        {t(ship.name)}
      </Typography>

      <EditButton title="ステータスを編集" size="tiny" />
      <InfoButton size="tiny" onClick={onDetailClick} />
      <StarButton title="艦娘プリセットに追加" size="tiny" />
      <UpdateButton title="艦娘を変更" size="tiny" />
      <ClearButton title="削除" size="tiny" onClick={onRemove} />
    </div>
  )
}

export default styled(ShipHeader)`
  display: flex;
  align-items: center;
  height: 24px;
`
