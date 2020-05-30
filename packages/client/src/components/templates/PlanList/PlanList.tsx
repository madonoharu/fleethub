import React from "react"
import { PlanState, isNonNullable } from "@fleethub/core"
import { useDispatch, useSelector } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { RemoveButton } from "../../../components"
import { plansSlice, plansSelectors, planEditorSlice } from "../../../store"
import { usePlan } from "../../../hooks"

const PlanListItem: React.FC<{ planId: EntityId }> = ({ planId }) => {
  const dispatch = useDispatch()
  const { plan, actions } = usePlan(planId)
  if (!plan) return null

  const handleOpen = () => dispatch(planEditorSlice.actions.update({ planId }))

  return (
    <Paper>
      <Button onClick={handleOpen}>{plan.name}</Button>

      <RemoveButton onClick={actions.remove} />
    </Paper>
  )
}

const PlanList: React.FC = (props) => {
  const dispatch = useDispatch()
  const planEntities = useSelector((state) => plansSelectors.selectEntities(state))

  const actions = React.useMemo(() => {
    const create = (state: PlanState) => dispatch(plansSlice.actions.create(state))
    const remove = (id: EntityId) => dispatch(plansSlice.actions.remove(id))

    return { create, remove }
  }, [dispatch])

  const plans = Object.values(planEntities).filter(isNonNullable)

  const handleCreate = () => {
    const name = `編成${plans.length + 1}`
    actions.create({ name })
  }

  return (
    <Container>
      <Button onClick={handleCreate}>add plan</Button>
      {plans.map((plan) => (
        <PlanListItem key={plan.id} planId={plan.id} />
      ))}
    </Container>
  )
}

export default PlanList
