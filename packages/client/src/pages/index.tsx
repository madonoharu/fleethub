import React from "react"
import { useSelector, useDispatch } from "react-redux"

import { Button } from "@material-ui/core"

import { PlanPanel } from "../components"
import { entitiesSlice, plansSelectors } from "../store"

const getInitalFleet = () => ({ ships: [...Array(6)] })

const IndexPage: React.FC = () => {
  const dispatch = useDispatch()
  const planIds = useSelector((state) => plansSelectors.selectIds(state.entities))

  const createPlan = () =>
    dispatch(
      entitiesSlice.actions.createPlan({
        name: "a",
        fleets: [getInitalFleet(), getInitalFleet(), getInitalFleet(), getInitalFleet()],
        airbases: [],
      })
    )

  return (
    <>
      <Button onClick={createPlan}>add plan</Button>
      {planIds.map((id) => (
        <PlanPanel key={id} plan={id} />
      ))}
    </>
  )
}

export default IndexPage
