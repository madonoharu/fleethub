import React from "react"
import { useSelector, useDispatch } from "react-redux"

import { PlanEditor } from "../components"
import { uiSlice, plansSelectors, filesSlice } from "../store"

const IndexPage: React.FC = () => {
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

export default IndexPage
