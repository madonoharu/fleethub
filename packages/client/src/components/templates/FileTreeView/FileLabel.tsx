import React from "react"
import styled from "styled-components"

import { Flexbox, DraggableFile, DraggableFileProps } from "../../../components"

const FileLabelAction = styled.div`
  display: none;
  margin-left: auto;
`

const FileLabelText = styled.div`
  width: calc(100% - 128px);
  margin-left: 8px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

export type FileLabelProps = {
  icon: React.ReactNode
  text: React.ReactNode
  action: React.ReactNode
  onClick?: () => void
} & DraggableFileProps

const handleActionClick = (event: React.MouseEvent) => event.preventDefault()

const FileLabel: React.FCX<FileLabelProps> = ({ className, icon, text, action, onClick, file, canDrop, onDrop }) => {
  return (
    <DraggableFile file={file} canDrop={canDrop} onDrop={onDrop}>
      <Flexbox className={className}>
        {icon}
        <FileLabelText onClick={onClick}>{text}</FileLabelText>
        <FileLabelAction onClick={handleActionClick}>{action}</FileLabelAction>
      </Flexbox>
    </DraggableFile>
  )
}

export default styled(FileLabel)`
  box-sizing: content-box;
  height: 24px;

  :hover ${FileLabelAction} {
    display: block;
  }
`
