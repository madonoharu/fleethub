import React from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"

import { PlanEditor } from "../../../components"
import { plansSelectors, filesSlice, openFirstPlan, selectAppState } from "../../../store"
import { parseUrlEntities } from "../../../firebase"
import { useFetch } from "../../../hooks"

import AppBar from "./AppBar"

const FileLoader: React.FC = () => {
  const dispatch = useDispatch()
  const planId = useSelector((state) => {
    const { planId } = selectAppState(state)
    return planId && plansSelectors.selectById(state, planId)?.id
  })

  useFetch(async () => {
    const entities = await parseUrlEntities()
    if (entities) {
      dispatch(filesSlice.actions.import({ ...entities, to: "temp" }))
      return
    }

    if (planId) return

    dispatch(openFirstPlan())
  }, [dispatch, planId])

  if (planId) return <PlanEditor planId={planId} />

  return null
}

const ScrollContainer = styled.div`
  overflow-y: scroll;
  height: calc(100vh - 24px);
`

const Bottom = styled.div`
  height: 400px;
`

const AppContent: React.FC = () => (
  <>
    <AppBar />
    <ScrollContainer>
      <FileLoader />
      <Bottom />
    </ScrollContainer>
  </>
)

export default AppContent
