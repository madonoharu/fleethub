import React from "react"
import styled from "styled-components"

import { Flexbox, DraggableFile, DraggableFileProps, PlanFileIcon, FolderIcon } from "../../../components"
import { FileType } from "../../../store"

const getFileIcon = (type: FileType) => {
  return type === "plan" ? PlanFileIcon : FolderIcon
}

const FileLabelAction = styled.div`
  flex-shrink: 0;
  display: none;
`

const FileLabelText = styled.span`
  flex-shrink: 1;
  flex-grow: 1;
  margin: 0 8px;
  font-size: 0.75rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

export type FileLabelProps = {
  text: React.ReactNode
  action: React.ReactNode
  onClick?: () => void
} & DraggableFileProps

const handleActionClick = (event: React.MouseEvent) => event.preventDefault()

const FileLabel: React.FCX<FileLabelProps> = ({ className, text, action, onClick, file, canDrop, onDrop }) => {
  const Icon = getFileIcon(file.type)

  return (
    <DraggableFile file={file} canDrop={canDrop} onDrop={onDrop}>
      <Flexbox className={className}>
        <Icon fontSize="small" />
        <FileLabelText onClick={onClick}>{text}</FileLabelText>
        <FileLabelAction onClick={handleActionClick}>{action}</FileLabelAction>
      </Flexbox>
    </DraggableFile>
  )
}

export default styled(FileLabel)`
  height: 24px;

  :hover ${FileLabelAction} {
    display: block;
  }
`
