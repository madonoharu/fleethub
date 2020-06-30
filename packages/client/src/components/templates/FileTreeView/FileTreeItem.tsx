import React from "react"
import { useDrop, useDrag } from "react-dnd"

import TreeItem, { TreeItemProps } from "@material-ui/lab/TreeItem"

import { FileEntity } from "../../../store"

type Props = TreeItemProps & {
  file: FileEntity
  isParentOf: (file: FileEntity) => boolean
  onMove?: (id: string, to?: string) => void
}

const FileTreeItem: React.FC<Props> = ({ file, isParentOf, onMove, label, ...rest }) => {
  const item = {
    type: "file",
    file,
    isParentOf,
  }

  const [, dragRef] = useDrag({ item })
  const [isOver, dropRef] = useDrop({
    accept: item.type,

    canDrop: (dragItem: typeof item) => dragItem.file !== file && !dragItem.isParentOf(file),

    drop: (dragItem) => onMove?.(dragItem.file.id, file.id),

    collect: (monitor) => monitor.isOver(),
  })

  return (
    <TreeItem
      label={
        <div
          ref={(node) => dragRef(dropRef(node as Element))}
          style={isOver ? { borderBottom: "solid 1px", marginBottom: -1 } : undefined}
        >
          {label}
        </div>
      }
      {...rest}
    />
  )
}

export default FileTreeItem
