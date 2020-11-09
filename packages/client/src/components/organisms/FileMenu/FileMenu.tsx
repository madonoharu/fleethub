import React from "react"
import styled from "@emotion/styled"

import { useFile } from "../../../hooks"

import FileForm from "../FileForm"

import PlanMenu from "./PlanMenu"
import FolderMenu from "./FolderMenu"

type Props = {
  id: string
  onClose?: () => void
}

const FileMenu: React.FCX<Props> = ({ className, id, onClose }) => {
  const { file, actions } = useFile(id)

  if (!file) return null

  const handleCopy = () => {
    actions.copy()
    onClose?.()
  }

  const handleRemove = () => {
    actions.remove()
    onClose?.()
  }

  return (
    <div className={className}>
      <FileForm
        file={file}
        onCopy={handleCopy}
        onRemove={handleRemove}
        onNameChange={actions.setName}
        onDescriptionChange={actions.setDescription}
      />

      {file.type === "folder" ? <FolderMenu id={id} /> : <PlanMenu id={id} />}
    </div>
  )
}

export default styled(FileMenu)`
  min-height: 400px;
  width: 400px;
  padding: 8px;
`
