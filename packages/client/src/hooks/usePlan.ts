import React from "react"
import { PlanState } from "@fleethub/core"
import produce from "immer"
import { AppThunk } from "@reduxjs/toolkit"
import { useDispatch, useSelector } from "react-redux"

import { Update, Recipe } from "../utils"
import { plansSlice, plansSelectors, removeFile } from "../store"

import { useCachedFhFactory } from "./useCachedFhFactory"

const makeUpdatePlan = (id: string, recipe: Recipe<PlanState>): AppThunk => (dispatch, getState) => {
  const state = plansSelectors.selectById(getState(), id)
  if (!state) return

  const next = produce(state, recipe)
  dispatch(plansSlice.actions.set(next))
}

export const usePlan = (id: string) => {
  const dispatch = useDispatch()
  const state = useSelector((state) => plansSelectors.selectById(state, id))

  const { createPlan } = useCachedFhFactory()

  const actions = React.useMemo(() => {
    const update: Update<PlanState> = (recipe) => dispatch(makeUpdatePlan(id, recipe))

    const remove = () => dispatch(removeFile(id))

    return { update, remove }
  }, [dispatch, id])

  const plan = state && createPlan(state)

  return { state, actions, plan }
}
