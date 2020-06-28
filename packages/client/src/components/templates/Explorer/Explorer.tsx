import React from "react"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"

import { Container, Button } from "@material-ui/core"

import {
  filesSelectors,
  filesSlice,
  removeFile,
  NormalizedFile,
  cloneEntities,
  copyFile,
  shareFile,
} from "../../../store"
import { FileTreeView, FileTreeViewProps } from "../../../components"

import { useObjectVal } from "react-firebase-hooks/database"
import { useAuthState } from "react-firebase-hooks/auth"
import { login, firebase, createShareUrl } from "../../../firebase"
import { Dictionary } from "@reduxjs/toolkit"

type Props = {
  onPlanSelect?: (id: string) => void
  onPlanCreate?: () => void
}

const UserFileTreeView: React.FCX<{ user: firebase.User }> = ({ user }) => {
  const databaseRef = firebase.database().ref(`users/${user.uid}`)
  const [value] = useObjectVal(databaseRef)
  const state = useSelector((state) => state)

  const handleClick = () => {
    const { files } = cloneEntities(state, "root")
    const dict: Dictionary<NormalizedFile> = {}
    files.forEach((file) => {
      dict[file.id] = file
    })
    databaseRef.set(dict)
  }

  console.log(value)

  return (
    <>
      <Button onClick={handleClick}>upload</Button>
      {value && <FileTreeView entities={value as Dictionary<NormalizedFile>} />}
    </>
  )
}

const Explorer: React.FCX<Props> = ({ className, onPlanSelect, onPlanCreate }) => {
  const dispatch = useDispatch()
  const fileEntities = useSelector(filesSelectors.selectEntities)

  const handleFileUpdate: FileTreeViewProps["onFileUpdate"] = (payload) => {
    dispatch(filesSlice.actions.update(payload))
  }

  const handlePlanCreate: FileTreeViewProps["onPlanCreate"] = (payload) => {
    dispatch(filesSlice.actions.createPlan(payload))
    onPlanCreate?.()
  }

  const handleFolderCreate: FileTreeViewProps["onFolderCreate"] = (parent) => {
    dispatch(filesSlice.actions.createFolder(parent))
  }

  const handleCopy: FileTreeViewProps["onCopy"] = (id) => dispatch(copyFile(id))

  const handleMove: FileTreeViewProps["onMove"] = (payload) => {
    dispatch(filesSlice.actions.move(payload))
  }

  const handleRemove = (id: string) => dispatch(removeFile(id))

  const [user] = useAuthState(firebase.auth())

  return (
    <Container className={className}>
      <Button onClick={() => dispatch(shareFile("root"))}>upload</Button>
      <FileTreeView
        entities={fileEntities}
        onFileUpdate={handleFileUpdate}
        onPlanSelect={onPlanSelect}
        onPlanCreate={handlePlanCreate}
        onFolderCreate={handleFolderCreate}
        onCopy={handleCopy}
        onMove={handleMove}
        onRemove={handleRemove}
      />
    </Container>
  )
}

export default styled(Explorer)`
  width: 640px;
  height: 80vh;
`
