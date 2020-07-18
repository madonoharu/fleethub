import React from "react"
import { useDispatch, useSelector } from "react-redux"
import styled from "styled-components"

import DescriptionIcon from "@material-ui/icons/Description"
import FileCopyIcon from "@material-ui/icons/FileCopy"
import DeleteIcon from "@material-ui/icons/Delete"

import { MoreVertButton, ShareButton, RemoveButton, MenuList } from "../../../components"
import { PlanFileEntity, plansSelectors } from "../../../store"
import { usePopover } from "../../../hooks"

import FileLabel, { FileLabelProps } from "./FileLabel"

const usePlanFile = (id: string) => {
  const plan = useSelector((state) => plansSelectors.selectById(state, id))

  return { plan }
}

type Props = {
  file: PlanFileEntity
  onOpen: (id: string) => void
  onCopy: (id: string) => void
  onRemove: (id: string) => void
} & Pick<FileLabelProps, "onMove" | "isParentOf">

const PlanFileLabel: React.FCX<Props> = ({ className, file, onOpen, onCopy, onRemove, onMove, isParentOf }) => {
  const { plan } = usePlanFile(file.id)
  const Popover = usePopover()

  if (!plan) return null

  const handleOpen = () => {
    onOpen(file.id)
  }

  const handleCopy = () => {
    onCopy(file.id)
    Popover.hide()
  }

  const handleRemove = () => onRemove(file.id)

  return (
    <FileLabel
      className={className}
      file={file}
      onMove={onMove}
      isParentOf={isParentOf}
      icon={<DescriptionIcon />}
      text={plan.name}
      onClick={handleOpen}
      action={
        <>
          <ShareButton size="small" />
          <RemoveButton size="small" onClick={handleRemove} />
          <MoreVertButton size="small" onClick={Popover.show} />
          <Popover>
            <MenuList
              list={[
                { icon: <FileCopyIcon />, text: "コピー", onClick: handleCopy },
                { icon: <DeleteIcon />, text: "削除", onClick: handleRemove },
              ]}
            />
          </Popover>
        </>
      }
    />
  )
}

export default styled(PlanFileLabel)``
