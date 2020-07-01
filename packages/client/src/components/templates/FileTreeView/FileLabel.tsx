import React from "react"
import styled from "styled-components"

import { Flexbox } from "../../../components"
import { FileEntity, isStatic } from "../../../store"

import { useDrop, useDrag } from "react-dnd"

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

  file: FileEntity
  canDrag?: boolean
  isParentOf: (file: FileEntity) => boolean
  onMove?: (id: string, to?: string) => void
}

const handleActionClick = (event: React.MouseEvent) => event.preventDefault()

const FileLabel: React.FCX<FileLabelProps> = ({
  className,
  icon,
  text,
  action,
  onClick,
  file,
  canDrag = true,
  isParentOf,
  onMove,
}) => {
  const item = {
    type: "file",
    file,
    isParentOf,
  }

  const [, dragRef] = useDrag({ item, canDrag: canDrag && !isStatic(file) })
  const [isOver, dropRef] = useDrop({
    accept: item.type,

    canDrop: (dragItem: typeof item) => dragItem.file !== file && !dragItem.isParentOf(file),

    drop: (dragItem) => onMove?.(dragItem.file.id, file.id),

    collect: (monitor) => monitor.isOver(),
  })

  return (
    <Flexbox
      ref={(node) => dragRef(dropRef(node as Element))}
      style={isOver ? { borderBottom: "solid 1px", marginBottom: -1 } : undefined}
      className={className}
    >
      {icon}
      <FileLabelText onClick={onClick}>{text}</FileLabelText>
      <FileLabelAction onClick={handleActionClick}>{action}</FileLabelAction>
    </Flexbox>
  )
}

export default styled(FileLabel)`
  box-sizing: content-box;
  height: 24px;

  :hover ${FileLabelAction} {
    display: block;
  }
`
