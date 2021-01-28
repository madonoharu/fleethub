import React from "react"
import styled from "@emotion/styled"

import { FolderEntity } from "../../../store"
import { useModal, useFile } from "../../../hooks"

import { MoreVertButton, RemoveButton, OpenInNewButton } from "../../molecules"

import FileMenu from "../../organisms/FileMenu"

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
          <OpenInNewButton size="tiny" title="フォルダーページを開く" onClick={actions.open} />
          <RemoveButton size="tiny" title="削除" onClick={actions.remove} />
          <MoreVertButton size="tiny" title="メニュー" onClick={Modal.show} />

          <Modal>
            <FileMenu id={file.id} onClose={Modal.hide} />
          </Modal>
        </>
      }
    />
  )
}

export default styled(FolderLabel)``
