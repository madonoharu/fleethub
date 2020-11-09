import React from "react"
import styled from "@emotion/styled"

import { MoreVertButton, CopyButton, RemoveButton, FileMenu } from "../../../components"
import { PlanFileEntity } from "../../../store"
import { useModal, useFile } from "../../../hooks"

import FileLabel from "./FileLabel"

type Props = {
  file: PlanFileEntity
}

const PlanFileLabel: React.FCX<Props> = ({ className, file }) => {
  const { actions, canDrop } = useFile(file.id)
  const MenuModal = useModal()

  return (
    <>
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
            <MoreVertButton size="small" title="メニュー" onClick={MenuModal.show} />
          </>
        }
      />

      <MenuModal>
        <FileMenu id={file.id} onClose={MenuModal.hide} />
      </MenuModal>
    </>
  )
}

export default styled(PlanFileLabel)``
