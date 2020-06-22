import React from "react"

import { PlanList, PlanEditor } from "../components"
import { useSelector, useDispatch } from "react-redux"
import { uiSlice } from "../store"

const IndexPage: React.FC = () => {
  const planId = useSelector((state) => state.ui.planId)
  const dispatch = useDispatch()

  if (planId === undefined) return <PlanList />
  return <PlanEditor planId={planId} onClose={() => dispatch(uiSlice.actions.closePlan())} />
}

export default IndexPage
