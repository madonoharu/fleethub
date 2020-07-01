import React from "react"
import { useSelector, useDispatch } from "react-redux"
import styled from "styled-components"

import { plansSelectors, filesSlice, openFirstPlan, selectAppState } from "../../../store"
import { PlanEditor } from "../../../components"

import AppBar from "./AppBar"
import { parseUrlEntities } from "../../../firebase"
import { useFetch } from "../../../hooks"

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

const AppContent: React.FC = () => (
  <>
    <AppBar />
    <ScrollContainer>
      <FileLoader />
    </ScrollContainer>
  </>
)

export default AppContent
