import React from "react"
import { PageProps } from "gatsby"

import { PlanList, PlanEditor } from "../components"
import { useSelector } from "react-redux"

const PlansPage: React.FC<PageProps> = ({ location }) => {
  const planId = useSelector((state) => state.planEditor.planId)

  if (planId === undefined) return <PlanList />
  return <PlanEditor planId={planId} />
}

export default PlansPage
