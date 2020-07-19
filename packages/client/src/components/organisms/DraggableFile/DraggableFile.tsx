import React from "react"
import styled from "styled-components"
import { useForkRef } from "@material-ui/core"

import { useDrag, useDrop } from "../../../hooks"
import { FileEntity } from "../../../store"

const Container = styled.div`
  &.dragging {
    opacity: 0.3;
  }

  &.droppable {
    border-bottom: solid 1px;
    margin-bottom: -1px;
  }
`

export type DraggableFileProps = {
  file: FileEntity
  canDrop: (dragFile: FileEntity) => boolean
  onDrop: (dragFile: FileEntity) => void
}

const DraggableFile: React.FCX<DraggableFileProps> = ({ className, file, canDrop, onDrop, children }) => {
  const element = <Container className={className}>{children}</Container>

  const item = {
    type: "file",
    file,
  }

  const dragRef = useDrag({
    item,
    dragLayer: element,
  })

  const dropRef = useDrop({
    accept: item.type,
    canDrop: (dragItem: typeof item) => canDrop(dragItem.file),
    drop: (dragItem) => onDrop(dragItem.file),
  })

  const ref = useForkRef(dragRef, dropRef)

  return React.cloneElement(element, { ref })
}

export default DraggableFile
