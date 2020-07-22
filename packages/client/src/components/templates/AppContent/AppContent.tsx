import React from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"
import { useAsync } from "react-async-hook"

import { filesSlice, selectAppState, appSlice } from "../../../store"
import { DragLayerProvider } from "../../../hooks"
import { parseUrlData } from "../../../utils"

import AppBar from "./AppBar"
import ExplorerDrawer from "./ExplorerDrawer"
import FileViewer from "./FileViewer"

const Bottom = styled.div`
  height: 400px;
`

const AppContent: React.FC = () => {
  const dispatch = useDispatch()
  const explorerOpen = useSelector((state) => selectAppState(state).explorerOpen)
  const toggleExplorerOpen = () => dispatch(appSlice.actions.toggleExplorerOpen())

  const asyncEntitiesImport = useAsync(async () => {
    const data = await parseUrlData()
    if (!data) return
    console.log(data)
    dispatch(filesSlice.actions.import({ ...data, to: "root" }))
  }, [])

  if (asyncEntitiesImport.loading) return null

  return (
    <DragLayerProvider>
      <AppBar explorerOpen={explorerOpen} onExplorerOpen={toggleExplorerOpen} />
      <ExplorerDrawer open={explorerOpen}>
        <FileViewer />
        <Bottom />
      </ExplorerDrawer>
    </DragLayerProvider>
  )
}

export default AppContent
