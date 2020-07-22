import React from "react"
import styled from "styled-components"

import { MoreVertButton, RemoveButton, OpenInNewButton, FolderMenu } from "../../../components"
import { FolderEntity } from "../../../store"
import { useModal, useFile } from "../../../hooks"

import FileLabel from "./FileLabel"

type Props = {
  file: FolderEntity
}

const FolderLabel: React.FCX<Props> = ({ className, file }) => {
  const { actions, canDrop } = useFile(file.id)
  const Modal = useModal()

  return (
    <FileLabel
      className={className}
      file={file}
      text={file.name}
      canDrop={canDrop}
      onDrop={actions.drop}
      action={
        <>
          <OpenInNewButton size="small" title="フォルダーページを開く" onClick={actions.open} />
          <RemoveButton size="small" title="削除" onClick={actions.remove} />
          <MoreVertButton size="small" title="メニュー" onClick={Modal.show} />

          <Modal>
            <FolderMenu id={file.id} />
          </Modal>
        </>
      }
    />
  )
}

export default styled(FolderLabel)``
