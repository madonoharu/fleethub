import React from "react"
import styled from "styled-components"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { ActionCreators } from "redux-undo"

import { AppBar as MuiAppBar, Link, Box, Button } from "@material-ui/core"
import UndoIcon from "@material-ui/icons/Undo"
import RedoIcon from "@material-ui/icons/Redo"

import { FileTreeView, withIconButton } from "../../../components"
import { useModal } from "../../../hooks"
import { uiSlice } from "../../../store"

import LanguageSelect from "./LanguageSelect"

const UndoButton = withIconButton(UndoIcon)
const RedoButton = withIconButton(RedoIcon)

const AppBar: React.FCX = ({ className }) => {
  const { t } = useTranslation()

  const dispatch = useDispatch()
  const canUndo = useSelector((state) => state.entities.past.length > 0)
  const canRedo = useSelector((state) => state.entities.future.length > 0)

  const Modal = useModal()

  const handlePlanSelect = (id: string) => {
    dispatch(uiSlice.actions.openPlan(id))
    Modal.hide()
  }

  const undo = () => canUndo && dispatch(ActionCreators.undo())
  const redo = () => canRedo && dispatch(ActionCreators.redo())

  const paths = [
    { to: "/", children: t("home") },
    { to: "/gears", children: t("gears") },
    { to: "/ships", children: t("ships") },
  ]

  return (
    <MuiAppBar className={className} position="sticky">
      <Box display="flex" width="100%">
        <UndoButton size="small" disabled={!canUndo} onClick={undo} />
        <RedoButton size="small" disabled={!canRedo} onClick={redo} />
        <Button size="small" onClick={Modal.show}>
          編成一覧
        </Button>

        {paths.map((path) => (
          <Link key={path.to} {...path} />
        ))}

        <Modal>
          <FileTreeView onPlanSelect={handlePlanSelect} onPlanCreate={Modal.hide} />
        </Modal>
      </Box>
    </MuiAppBar>
  )
}

export default styled(AppBar)`
  display: flex;
  flex-direction: row;
  height: 24px;

  ${({ theme }) => theme.acrylic}

  > * {
    color: white;
  }
  ${LanguageSelect} {
    flex-grow: 10;
  }
`
