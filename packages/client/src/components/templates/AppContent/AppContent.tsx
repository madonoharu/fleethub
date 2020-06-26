import React from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"

import { uiSlice, plansSelectors, filesSlice } from "../../../store"
import { PlanEditor } from "../../../components"

import AppBar from "./AppBar"

const FileLoader: React.FC = () => {
  const ids = useSelector(plansSelectors.selectIds) as string[]
  const planId = useSelector((state) => state.ui.planId && plansSelectors.selectById(state, state.ui.planId)?.id)

  const dispatch = useDispatch()

  React.useEffect(() => {
    if (planId) return
    if (ids.length === 0) {
      dispatch(filesSlice.actions.createPlan({}))
    } else {
      dispatch(uiSlice.actions.openPlan(ids[ids.length - 1]))
    }
  }, [dispatch, ids, planId])

  if (planId) return <PlanEditor planId={planId} />

  return null
}

const ScrollContainer = styled.div`
  overflow-y: scroll;
  height: calc(100vh - 24px);
`

const AppContent: React.FC = () => (
  <>
    <AppBar />
    <ScrollContainer>
      <FileLoader />
    </ScrollContainer>
  </>
)

export default AppContent
