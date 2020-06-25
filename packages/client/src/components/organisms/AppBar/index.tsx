import React from "react"
import styled from "styled-components"
import { useTranslation } from "react-i18next"

import AppBar from "@material-ui/core/AppBar"
import Box from "@material-ui/core/Box"
import MuiButton from "@material-ui/core/Button"
import UndoIcon from "@material-ui/icons/Undo"
import RedoIcon from "@material-ui/icons/Redo"

import { Link, Select } from "../../../components"

import LanguageSelect from "./LanguageSelect"

import { useDispatch, useSelector } from "react-redux"
import { ActionCreators } from "redux-undo"
import { withIconButton } from "../../molecules"

const UndoButton = withIconButton(UndoIcon)
const RedoButton = withIconButton(RedoIcon)

const Component: React.FCX = ({ className }) => {
  const { t } = useTranslation()

  const dispatch = useDispatch()
  const canUndo = useSelector((state) => state.entities.past.length > 0)
  const canRedo = useSelector((state) => state.entities.future.length > 0)

  const undo = () => canUndo && dispatch(ActionCreators.undo())
  const redo = () => canRedo && dispatch(ActionCreators.redo())

  const paths = [
    { to: "/", children: t("home") },
    { to: "/gears", children: t("gears") },
    { to: "/ships", children: t("ships") },
  ]

  return (
    <AppBar className={className} position="sticky">
      <Box display="flex" justifyContent="end" width="100%">
        {paths.map((path) => (
          <Link key={path.to} {...path} />
        ))}
        <UndoButton size="small" disabled={!canUndo} onClick={undo} />
        <RedoButton size="small" disabled={!canRedo} onClick={redo} />
        <LanguageSelect />
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
