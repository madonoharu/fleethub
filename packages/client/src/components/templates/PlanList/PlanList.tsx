import React from "react"
import { PlanState, isNonNullable } from "@fleethub/core"
import { useDispatch, useSelector } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { useCachedFhFactory } from "../../../hooks"
import { Update } from "../../../utils"
import { plansSlice, plansSelectors, planEditorSlice } from "../../../store"

const PlanListItem: React.FC<{ planId: EntityId }> = ({ planId }) => {
  const dispatch = useDispatch()

  const handleClick = () => dispatch(planEditorSlice.actions.update({ planId }))
  return <Button onClick={handleClick}>{planId}</Button>
}

const PlanList: React.FC = (props) => {
  const dispatch = useDispatch()
  const planEntities = useSelector((state) => plansSelectors.selectEntities(state))

  const actions = React.useMemo(() => {
    const create = () => dispatch(plansSlice.actions.create({ name: "a", f1: {}, f2: {} }))
    const remove = (id: EntityId) => dispatch(plansSlice.actions.remove(id))

    return { create, remove }
  }, [dispatch])

  const plans = Object.values(planEntities).filter(isNonNullable)

  return (
    <Container>
      <Button onClick={actions.create}>add plan</Button>
      {plans.map((plan) => (
        <PlanListItem key={plan.id} planId={plan.id} />
      ))}
    </Container>
  )
}

export default PlanList
