import React from "react"
import { PlanState } from "@fleethub/core"
import produce from "immer"
import { AppThunk, EntityId } from "@reduxjs/toolkit"
import { useDispatch, useSelector } from "react-redux"

import { Update } from "../utils"
import { plansSlice, plansSelectors } from "../store"

import { useCachedFhFactory } from "./useCachedFhFactory"

const makeUpdatePlan = (id: EntityId, updater: Update<PlanState>): AppThunk => (dispatch, getState) => {
  const state = plansSelectors.selectById(getState(), id)
  if (!state) return

  const payload = produce(state, updater)
  dispatch(plansSlice.actions.upsert(payload))
}

export const usePlan = (id: EntityId) => {
  const dispatch = useDispatch()
  const state = useSelector((state) => plansSelectors.selectById(state, id))

  const { createPlan } = useCachedFhFactory()

  const update: Update<PlanState> = React.useCallback((updater) => dispatch(makeUpdatePlan(id, updater)), [
    dispatch,
    id,
  ])

  const plan = state && createPlan(state)

  return { state, update, plan }
}
