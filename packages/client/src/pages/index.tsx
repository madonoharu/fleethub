import React from "react"

import { PlanList, PlanEditor } from "../components"
import { useSelector, useDispatch } from "react-redux"
import { planEditorSlice } from "../store"

const IndexPage: React.FC = () => {
  const planId = useSelector((state) => state.planEditor.planId)
  const dispatch = useDispatch()

  if (planId === undefined) return <PlanList />
  return <PlanEditor planId={planId} onClose={() => dispatch(planEditorSlice.actions.close())} />
}

export default IndexPage
