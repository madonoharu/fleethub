import { useMemo } from "react"
import { useSelector } from "react-redux"

import { plansSelectors } from "../store"

import { useFhSystem } from "./useFhSystem"

export const useFhPlan = (id: string) => {
  const { createPlan } = useFhSystem()
  const state = useSelector((state) => plansSelectors.selectById(state, id))
  return useMemo(() => state && createPlan(state), [createPlan, state])
}
