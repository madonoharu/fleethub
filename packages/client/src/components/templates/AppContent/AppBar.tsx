import React from "react"
import styled from "styled-components"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { ActionCreators } from "redux-undo"

import { AppBar as MuiAppBar, Button } from "@material-ui/core"
import UndoIcon from "@material-ui/icons/Undo"
import RedoIcon from "@material-ui/icons/Redo"
import FolderIcon from "@material-ui/icons/Folder"
import FolderOpenIcon from "@material-ui/icons/FolderOpen"

import { withIconButton } from "../../../components"
import { useModal } from "../../../hooks"

import LanguageSelect from "./LanguageSelect"
import ShipList from "../ShipList"
import GearList from "../GearList"
import MapList from "../MapList"

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
      <Button
        onClick={handleExplorerOpen}
        color="primary"
        startIcon={explorerOpen ? <FolderOpenIcon /> : <FolderIcon />}
      >
        編成一覧
      </Button>
      <UndoButton size="small" title="操作を戻す" disabled={!canUndo} onClick={undo} />
      <RedoButton size="small" title="操作を進める" disabled={!canRedo} onClick={redo} />

      <Button onClick={ShipListModal.show}>艦娘</Button>
      <Button onClick={GearListModal.show}>装備</Button>
      <Button onClick={MapListModal.show}>海域</Button>

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
  display: flex;
  align-items: center;
  flex-direction: row;

  > * {
    height: 32px;
  }

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
