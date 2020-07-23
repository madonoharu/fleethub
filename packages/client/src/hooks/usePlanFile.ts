import { useMemo } from "react"
import { useSelector } from "react-redux"

import { plansSelectors } from "../store"

import { useFhSystem } from "./useFhSystem"
import { useFile } from "./useFile"

export const usePlanFile = (id: string) => {
  const { createPlan } = useFhSystem()

  const state = useSelector((state) => plansSelectors.selectById(state, id))
  const plan = useMemo(() => state && createPlan(state), [createPlan, state])
  const { file, actions } = useFile(id)

  return { plan, file, actions }
}
