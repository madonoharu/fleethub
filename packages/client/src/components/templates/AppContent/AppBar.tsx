import React from "react"
import styled from "styled-components"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { ActionCreators } from "redux-undo"

import { AppBar as MuiAppBar, Button } from "@material-ui/core"
import UndoIcon from "@material-ui/icons/Undo"
import RedoIcon from "@material-ui/icons/Redo"

import { Explorer, withIconButton } from "../../../components"
import { useModal } from "../../../hooks"
import { appSlice } from "../../../store"

import LanguageSelect from "./LanguageSelect"
import ShipList from "../ShipList"
import GearList from "../GearList"
import MapList from "../MapList"

const UndoButton = withIconButton(UndoIcon)
const RedoButton = withIconButton(RedoIcon)

const AppBar: React.FCX = ({ className }) => {
  const { t } = useTranslation()

  const dispatch = useDispatch()
  const canUndo = useSelector((state) => state.past.length > 0)
  const canRedo = useSelector((state) => state.future.length > 0)

  const ExplorerModal = useModal()
  const ShipListModal = useModal()
  const GearListModal = useModal()
  const MapListModal = useModal()

  const handlePlanSelect = (id: string) => {
    dispatch(appSlice.actions.openFile(id))
    ExplorerModal.hide()
  }

  const undo = () => canUndo && dispatch(ActionCreators.undo())
  const redo = () => canRedo && dispatch(ActionCreators.redo())

  return (
    <MuiAppBar className={className} position="sticky">
      <UndoButton size="small" disabled={!canUndo} onClick={undo} />
      <RedoButton size="small" disabled={!canRedo} onClick={redo} />

      <Button onClick={ExplorerModal.show}>編成一覧</Button>

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

      <ExplorerModal>
        <Explorer onPlanSelect={handlePlanSelect} onPlanCreate={ExplorerModal.hide} />
      </ExplorerModal>
    </MuiAppBar>
  )
}

export default styled(AppBar)`
  display: flex;
  align-items: center;
  flex-direction: row;

  ${({ theme }) => theme.acrylic}

  > * {
    height: 32px;
  }

  > :nth-child(3) {
    margin-left: auto;
  }

  .MuiIconButton-root {
    height: 24px;
  }

  ${LanguageSelect} {
    flex-grow: 10;
  }
`
