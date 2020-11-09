import React, { useMemo } from "react"
import styled from "@emotion/styled"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { ActionCreators } from "redux-undo"

import { AppBar as MuiAppBar, Button, Link, Tooltip } from "@material-ui/core"
import UndoIcon from "@material-ui/icons/Undo"
import RedoIcon from "@material-ui/icons/Redo"
import MenuIcon from "@material-ui/icons/Menu"

import { withIconButton, GithubIcon, ImportButton, ImportMenu } from "../../../components"
import { useModal } from "../../../hooks"

import LanguageSelect from "./LanguageSelect"
import ShipList from "../ShipList"
import GearList from "../GearList"
import MapList from "../MapList"

const StyledButton = styled(Button)`
  height: 100%;
` as typeof Button

const UndoButton = withIconButton(UndoIcon)
const RedoButton = withIconButton(RedoIcon)

const useUndo = () => {
  const dispatch = useDispatch()

  const canUndo = useSelector((state) => state.past.length > 0)
  const canRedo = useSelector((state) => state.future.length > 0)

  const actions = useMemo(
    () => ({
      undo: () => dispatch(ActionCreators.undo()),
      redo: () => dispatch(ActionCreators.redo()),
    }),
    [dispatch]
  )

  return { canUndo, canRedo, ...actions }
}

type Props = {
  explorerOpen?: boolean
  onExplorerOpen: () => void
}

const AppBar: React.FCX<Props> = ({ explorerOpen, onExplorerOpen, className }) => {
  const { t } = useTranslation()

  const { canUndo, canRedo, undo, redo } = useUndo()

  const ImprotMenuModal = useModal()
  const ShipListModal = useModal()
  const GearListModal = useModal()
  const MapListModal = useModal()

  const handleExplorerOpen = () => {
    onExplorerOpen()
  }

  return (
    <MuiAppBar className={className} position="sticky">
      <StyledButton onClick={handleExplorerOpen} startIcon={<MenuIcon color={explorerOpen ? "primary" : "action"} />}>
        編成一覧
      </StyledButton>
      <ImportButton size="small" title="デッキビルダー形式などから編成を読み込む" onClick={ImprotMenuModal.show} />

      <UndoButton size="small" title="操作を戻す" disabled={!canUndo} onClick={undo} />
      <RedoButton size="small" title="操作を進める" disabled={!canRedo} onClick={redo} />

      <Tooltip title="GitHub repository">
        <StyledButton
          startIcon={<GithubIcon />}
          component={Link}
          href="https://github.com/MadonoHaru/fleethub"
          color="inherit"
        >
          作戦室 v{process.env.VERSION}
        </StyledButton>
      </Tooltip>

      <StyledButton onClick={ShipListModal.show}>艦娘</StyledButton>
      <StyledButton onClick={GearListModal.show}>装備</StyledButton>
      <StyledButton onClick={MapListModal.show}>海域</StyledButton>

      <ImprotMenuModal>
        <ImportMenu onClose={ImprotMenuModal.hide} />
      </ImprotMenuModal>

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

  > :nth-child(5) {
    margin-left: auto;
  }

  .MuiIconButton-root {
    height: 24px;
  }

  ${LanguageSelect} {
    flex-grow: 10;
  }
`
