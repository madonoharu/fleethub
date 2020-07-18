import React from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"

import { Container } from "@material-ui/core"

import { PlanEditor, DirectoryBreadcrumbs } from "../../../components"
import { filesSlice, openFirstPlan, selectAppState, filesSelectors, FileEntity, appSlice } from "../../../store"
import { parseUrlEntities } from "../../../firebase"
import { useFetch, DragLayerProvider } from "../../../hooks"

import DirectoryPage from "../DirectoryPage"

import AppBar from "./AppBar"
import ExplorerDrawer from "./ExplorerDrawer"

const renderFile = (file: FileEntity) => {
  if (file.type === "plan") return <PlanEditor planId={file.id} />

  return <DirectoryPage directory={file} />
}

const FileLoader: React.FC = () => {
  const dispatch = useDispatch()

  const file = useSelector((state) => {
    const { fileId } = selectAppState(state)
    return fileId && filesSelectors.selectById(state, fileId)
  })

  useFetch(async () => {
    const entities = await parseUrlEntities()
    if (entities) {
      dispatch(filesSlice.actions.import({ ...entities, to: "temp" }))
      return
    }

    if (file) return

    dispatch(openFirstPlan())
  }, [dispatch, file])

  if (!file) return null

  return (
    <>
      <DirectoryBreadcrumbs file={file} />
      {renderFile(file)}
    </>
  )
}

const Bottom = styled.div`
  height: 400px;
`

const AppContent: React.FC = () => {
  const dispatch = useDispatch()
  const explorerOpen = useSelector((state) => selectAppState(state).explorerOpen)
  const toggleExplorerOpen = () => dispatch(appSlice.actions.toggleExplorerOpen())
  return (
    <DragLayerProvider>
      <AppBar explorerOpen={explorerOpen} onExplorerOpen={toggleExplorerOpen} />
      <ExplorerDrawer open={explorerOpen}>
        <Container>
          <FileLoader />
        </Container>
        <Bottom />
      </ExplorerDrawer>
    </DragLayerProvider>
  )
}

export default AppContent
