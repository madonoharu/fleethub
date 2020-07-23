import React from "react"
import styled from "styled-components"

import { MoreVertButton, CopyButton, RemoveButton } from "../../../components"
import { PlanFileEntity } from "../../../store"
import { useModal, useFile } from "../../../hooks"

import FileLabel from "./FileLabel"

type Props = {
  file: PlanFileEntity
}

const PlanFileLabel: React.FCX<Props> = ({ className, file }) => {
  const { actions, canDrop } = useFile(file.id)
  const Modal = useModal()

  return (
    <FileLabel
      className={className}
      file={file}
      text={file.name}
      onClick={actions.open}
      canDrop={canDrop}
      onDrop={actions.drop}
      action={
        <>
          <CopyButton size="small" title="コピー" onClick={actions.copy} />
          <RemoveButton size="small" title="削除" onClick={actions.remove} />
          <MoreVertButton size="small" title="メニュー" onClick={Modal.show} />

          <Modal></Modal>
        </>
      }
    />
  )
}

export default styled(PlanFileLabel)``
