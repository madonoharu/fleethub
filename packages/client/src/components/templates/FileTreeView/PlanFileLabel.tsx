import React from "react"
import { useDispatch, useSelector } from "react-redux"

import { Container, Paper, TextField, Button, Typography } from "@material-ui/core"
import AssessmentIcon from "@material-ui/icons/Assessment"

import { CopyButton, MoreVertButton, ShareButton, AddButton, RemoveButton, Flexbox } from "../../../components"
import {
  isFolder,
  filesSelectors,
  filesSlice,
  FileType,
  NormalizedPlanFile,
  plansSelectors,
  plansSlice,
  removeFile,
} from "../../../store"
import { usePlan } from "../../../hooks"

const useFile = (id: string) => {
  const file = useSelector((state) => filesSelectors.selectById(state, id))
  const dispatch = useDispatch()

  const remove = () => dispatch(removeFile(id))

  return { file, remove }
}

const usePlanFile = (id: string) => {
  const { file, remove } = useFile(id)
  const plan = useSelector((state) => plansSelectors.selectById(state, id))

  return { file, plan, remove }
}

type Props = {
  file: NormalizedPlanFile
}

const PlanFileLabel: React.FC<Props> = ({ file }) => {
  const { plan, remove } = usePlanFile(file.id)

  if (!plan) return null

  return (
    <Flexbox>
      <AssessmentIcon />
      {plan.name}
      <RemoveButton size="small" onClick={remove} />
    </Flexbox>
  )
}

export default PlanFileLabel
