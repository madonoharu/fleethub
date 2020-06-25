import React from "react"
import { useDrop, useDrag } from "react-dnd"
import { useSelector } from "react-redux"

import TreeItem, { TreeItemProps } from "@material-ui/lab/TreeItem"

import { filesSelectors, NormalizedFile, flatFile } from "../../../store"

type Props = TreeItemProps & {
  file: NormalizedFile
  onMove?: (id: string, to?: string) => void
}

const FileTreeItem: React.FC<Props> = ({ file, label, onMove, ...rest }) => {
  const entities = useSelector(filesSelectors.selectEntities)

  const item = {
    type: "file",
    file,
    isParentOf: (dragFile: NormalizedFile) => flatFile(entities, file.id).includes(dragFile),
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
