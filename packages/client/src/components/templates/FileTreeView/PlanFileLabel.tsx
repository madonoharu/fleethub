import React from "react"
import { useDispatch, useSelector } from "react-redux"
import styled from "styled-components"

import DescriptionIcon from "@material-ui/icons/Description"
import FileCopyIcon from "@material-ui/icons/FileCopy"
import DeleteIcon from "@material-ui/icons/Delete"

import { MoreVertButton, ShareButton, RemoveButton, MenuList } from "../../../components"
import { filesSelectors, NormalizedPlanFile, plansSelectors, removeFile, cloneFile, uiSlice } from "../../../store"
import { usePopover } from "../../../hooks"

import FileLabel from "./FileLabel"

const useFile = (id: string) => {
  const file = useSelector((state) => filesSelectors.selectById(state, id))
  const dispatch = useDispatch()

  const clone = () => dispatch(cloneFile(id))
  const remove = () => dispatch(removeFile(id))

  return { file, clone, remove }
}

const usePlanFile = (id: string) => {
  const dispatch = useDispatch()
  const file = useSelector((state) => filesSelectors.selectById(state, id))
  const plan = useSelector((state) => plansSelectors.selectById(state, id))

  const clone = () => dispatch(cloneFile(id))
  const remove = () => dispatch(removeFile(id))

  return { file, plan, open, clone, remove }
}

type Props = {
  file: NormalizedPlanFile
  onSelect?: (id: string) => void
}

const PlanFileLabel: React.FCX<Props> = ({ className, file, onSelect }) => {
  const { plan, clone, remove } = usePlanFile(file.id)
  const Popover = usePopover()

  if (!plan) return null

  const handleOpen = () => {
    onSelect?.(file.id)
  }

  const handleCopy = () => {
    clone()
    Popover.hide()
  }

  return (
    <FileLabel
      className={className}
      icon={<DescriptionIcon />}
      text={plan.name}
      onClick={handleOpen}
      action={
        <>
          <ShareButton size="small" />
          <RemoveButton size="small" onClick={remove} />
          <MoreVertButton size="small" onClick={Popover.show} />
          <Popover>
            <MenuList
              list={[
                { icon: <FileCopyIcon />, text: "コピー", onClick: handleCopy },
                { icon: <DeleteIcon />, text: "削除", onClick: remove },
              ]}
            />
          </Popover>
        </>
      }
    />
  )
}

export default styled(PlanFileLabel)``
