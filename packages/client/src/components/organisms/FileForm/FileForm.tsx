import React from "react"
import styled from "@emotion/styled"

import { FileEntity } from "../../../store"

import { FolderIcon, PlanIcon, Flexbox } from "../../atoms"
import { CopyButton, RemoveButton, TextField } from "../../molecules"

type Props = {
  file: FileEntity
  onCopy: () => void
  onRemove: () => void
  onNameChange: (name: string) => void
  onDescriptionChange: (name: string) => void
}

const FileForm: React.FCX<Props> = ({ className, file, onCopy, onRemove, onNameChange, onDescriptionChange }) => {
  const icon = file.type === "folder" ? <FolderIcon /> : <PlanIcon />

  return (
    <div className={className}>
      <Flexbox>
        <TextField placeholder="name" fullWidth startLabel={icon} value={file.name} onChange={onNameChange} />
        <CopyButton title="コピーする" onClick={onCopy} />
        <RemoveButton title="削除する" onClick={onRemove} />
      </Flexbox>

      <TextField
        label="説明"
        variant="outlined"
        fullWidth
        value={file.description}
        onChange={onDescriptionChange}
        multiline
      />
    </div>
  )
}

export default FileForm
