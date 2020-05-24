import React from "react"
import { PlanState } from "@fleethub/core"
import produce from "immer"
import { AppThunk, EntityId } from "@reduxjs/toolkit"
import { useDispatch, useSelector } from "react-redux"

import { Update, Recipe } from "../utils"
import { plansSlice, plansSelectors } from "../store"

import { useCachedFhFactory } from "./useCachedFhFactory"

const makeUpdatePlan = (id: EntityId, recipe: Recipe<PlanState>): AppThunk => (dispatch, getState) => {
  const state = plansSelectors.selectById(getState(), id)
  if (!state) return

  const next = produce(state, recipe)
  dispatch(plansSlice.actions.set(next))
}

export const usePlan = (id: EntityId) => {
  const dispatch = useDispatch()
  const state = useSelector((state) => plansSelectors.selectById(state, id))

  const { createPlan } = useCachedFhFactory()

  const actions = React.useMemo(() => {
    const update: Update<PlanState> = (recipe) => dispatch(makeUpdatePlan(id, recipe))
    const remove = () => dispatch(plansSlice.actions.remove(id))

    return { update, remove }
  }, [dispatch, id])

  const plan = state && createPlan(state)

  return { state, actions, plan }
}
