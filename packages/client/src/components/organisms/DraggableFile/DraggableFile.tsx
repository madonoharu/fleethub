import React from "react"
import styled, { css } from "styled-components"
import { useForkRef } from "@material-ui/core"

import { useDrag, useDrop } from "../../../hooks"
import { FileEntity, FileType } from "../../../store"
import { useFileDrop } from "../FileDropZone"

const Container = styled.div<{ $type: FileType }>`
  &.dragging {
    opacity: 0.3;
  }

  &.droppable {
    ${({ theme, $type }) =>
      $type === "plan"
        ? css`
            border-bottom: solid 2px ${theme.colors.droppable};
            margin-bottom: -2px;
          `
        : css`
            outline: dashed 2px ${theme.colors.droppable};
          `}
  }
`

export type DraggableFileProps = {
  file: FileEntity
  canDrop: (dragFile: FileEntity) => boolean
  onDrop: (dragFile: FileEntity) => void
}

const DraggableFile: React.FCX<DraggableFileProps> = ({ className, file, canDrop, onDrop, children }) => {
  const element = (
    <Container className={className} $type={file.type}>
      {children}
    </Container>
  )

  const item = {
    type: "file",
    file,
  }

  const dragRef = useDrag({
    item,
    dragLayer: element,
  })

  const dropRef = useFileDrop({ canDrop, onDrop })

  const ref = useForkRef(dragRef, dropRef)

  return React.cloneElement(element, { ref })
}

export default DraggableFile
