import React from "react"

import { PlanList, PlanEditor } from "../components"
import { useSelector } from "react-redux"

const IndexPage: React.FC = () => {
  const planId = useSelector((state) => state.planEditor.planId)

  if (planId === undefined) return <PlanList />
  return <PlanEditor planId={planId} />
}

export default IndexPage
