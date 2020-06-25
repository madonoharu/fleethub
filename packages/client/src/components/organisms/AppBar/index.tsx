import React from "react"
import styled from "styled-components"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { ActionCreators } from "redux-undo"

import AppBar from "@material-ui/core/AppBar"
import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import UndoIcon from "@material-ui/icons/Undo"
import RedoIcon from "@material-ui/icons/Redo"

import { Link, FileTreeView } from "../../../components"
import { withIconButton } from "../../molecules"
import { useModal } from "../../../hooks"

import LanguageSelect from "./LanguageSelect"
import { uiSlice } from "../../../store"

const UndoButton = withIconButton(UndoIcon)
const RedoButton = withIconButton(RedoIcon)

const Component: React.FCX = ({ className }) => {
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
    <AppBar className={className} position="sticky">
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
    </AppBar>
  )
}

export default styled(Component)`
  display: flex;
  flex-direction: row;

  ${({ theme }) => theme.acrylic}

  > * {
    color: white;
  }
  ${LanguageSelect} {
    flex-grow: 10;
  }
`
