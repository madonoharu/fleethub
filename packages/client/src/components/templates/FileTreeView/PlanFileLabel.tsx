import React from "react"
import { useDispatch, useSelector } from "react-redux"
import styled from "styled-components"

import DescriptionIcon from "@material-ui/icons/Description"
import FileCopyIcon from "@material-ui/icons/FileCopy"
import DeleteIcon from "@material-ui/icons/Delete"

import { MoreVertButton, ShareButton, RemoveButton, MenuList } from "../../../components"
import { PlanFileEntity, plansSelectors } from "../../../store"
import { usePopover, useFile } from "../../../hooks"

import FileLabel from "./FileLabel"

const usePlanFile = (id: string) => {
  const plan = useSelector((state) => plansSelectors.selectById(state, id))

  return { plan }
}

type Props = {
  file: PlanFileEntity
}

const PlanFileLabel: React.FCX<Props> = ({ className, file }) => {
  const { actions, canDrop } = useFile(file.id)
  const { plan } = usePlanFile(file.id)
  const Popover = usePopover()

  if (!plan) return null

  return (
    <FileLabel
      className={className}
      file={file}
      icon={<DescriptionIcon />}
      text={plan.name}
      onClick={actions.open}
      canDrop={canDrop}
      onDrop={actions.drop}
      action={
        <>
          <ShareButton size="small" />
          <RemoveButton size="small" onClick={actions.remove} />
          <MoreVertButton size="small" onClick={Popover.show} />
          <Popover>
            <MenuList
              list={[
                { icon: <FileCopyIcon />, text: "コピー", onClick: actions.copy },
                { icon: <DeleteIcon />, text: "削除", onClick: actions.remove },
              ]}
            />
          </Popover>
        </>
      }
    />
  )
}

export default styled(PlanFileLabel)``
