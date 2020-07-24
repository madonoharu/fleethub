import React from "react"
import styled from "styled-components"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { ActionCreators } from "redux-undo"

import { AppBar as MuiAppBar, Button, Typography, Link, Tooltip } from "@material-ui/core"
import UndoIcon from "@material-ui/icons/Undo"
import RedoIcon from "@material-ui/icons/Redo"
import MenuIcon from "@material-ui/icons/Menu"

import { withIconButton, GithubIcon } from "../../../components"
import { useModal } from "../../../hooks"

import LanguageSelect from "./LanguageSelect"
import ShipList from "../ShipList"
import GearList from "../GearList"
import MapList from "../MapList"

const StyledLink = styled(Link)`
  line-height: 0;
  margin: 0 8px;
`

const StyledButton = styled(Button)`
  height: 100%;
`

const UndoButton = withIconButton(UndoIcon)
const RedoButton = withIconButton(RedoIcon)

type Props = {
  explorerOpen?: boolean
  onExplorerOpen: () => void
}

const AppBar: React.FCX<Props> = ({ explorerOpen, onExplorerOpen, className }) => {
  const { t } = useTranslation()

  const dispatch = useDispatch()
  const canUndo = useSelector((state) => state.past.length > 0)
  const canRedo = useSelector((state) => state.future.length > 0)

  const ShipListModal = useModal()
  const GearListModal = useModal()
  const MapListModal = useModal()

  const undo = () => canUndo && dispatch(ActionCreators.undo())
  const redo = () => canRedo && dispatch(ActionCreators.redo())

  const handleExplorerOpen = () => {
    onExplorerOpen()
  }

  return (
    <MuiAppBar className={className} position="sticky">
      <StyledButton onClick={handleExplorerOpen} startIcon={<MenuIcon color={explorerOpen ? "primary" : "action"} />}>
        編成一覧
      </StyledButton>

      <UndoButton size="small" title="操作を戻す" disabled={!canUndo} onClick={undo} />
      <RedoButton size="small" title="操作を進める" disabled={!canRedo} onClick={redo} />

      <Typography variant="body2">作戦室 v{process.env.VERSION}</Typography>
      <Tooltip title="GitHub repository">
        <StyledLink href="https://github.com/MadonoHaru/fleethub" color="inherit">
          <GithubIcon fontSize="small" />
        </StyledLink>
      </Tooltip>

      <StyledButton onClick={ShipListModal.show}>艦娘</StyledButton>
      <StyledButton onClick={GearListModal.show}>装備</StyledButton>
      <StyledButton onClick={MapListModal.show}>海域</StyledButton>

      <ShipListModal full>
        <ShipList />
      </ShipListModal>
      <GearListModal full>
        <GearList />
      </GearListModal>
      <MapListModal full>
        <MapList />
      </MapListModal>
    </MuiAppBar>
  )
}

export default styled(AppBar)`
  height: 32px;
  display: flex;
  align-items: center;
  flex-direction: row;

  > :nth-child(4) {
    margin-left: auto;
  }

  .MuiIconButton-root {
    height: 24px;
  }

  ${LanguageSelect} {
    flex-grow: 10;
  }
`
