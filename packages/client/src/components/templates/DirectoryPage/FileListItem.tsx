import React from "react"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"

import { Typography, ListItem, ListItemIcon, ListItemText, useForkRef } from "@material-ui/core"
import FolderIcon from "@material-ui/icons/Folder"
import DescriptionIcon from "@material-ui/icons/Description"
import UnarchiveIcon from "@material-ui/icons/Unarchive"

import {
  filesSelectors,
  plansSelectors,
  Directory,
  appSlice,
  filesSlice,
  FileEntity,
  FolderEntity,
  copyFile,
  removeFile,
} from "../../../store"

import { useFhSystem, useDrag, useDrop } from "../../../hooks"
import { ShipBanner, ShareButton, CopyButton, RemoveButton, withIconButton } from "../../molecules"
import { Flexbox } from "../../atoms"

const UnarchiveButton = withIconButton(UnarchiveIcon)

const ShipsContainer = styled.div`
  overflow: hidden;
  white-space: nowrap;
  line-height: 0;
`

const PlanName = styled(Typography)`
  width: 160px;
  flex-shrink: 0;
`

const FileAction = styled(Flexbox)`
  margin-left: auto;
`

const PlanItem: React.FC<{ id: string; onClick?: () => void }> = ({ id, onClick }) => {
  const state = useSelector((state) => plansSelectors.selectById(state, id))
  const { createPlan } = useFhSystem()
  if (!state) return null

  const plan = createPlan(state)

  return (
    <>
      <ListItemIcon>
        <DescriptionIcon />
      </ListItemIcon>
      <PlanName noWrap>{plan.name}</PlanName>
      <ShipsContainer>
        <div>
          {plan.main.ships.map((ship, index) => (
            <ShipBanner key={index} shipId={ship.shipId} />
          ))}
        </div>
        <div>
          {plan.escort?.ships.map((ship, index) => (
            <ShipBanner key={index} shipId={ship.shipId} />
          ))}
        </div>
      </ShipsContainer>
    </>
  )
}

const FolderItem: React.FC<{ file: FolderEntity }> = ({ file }) => {
  return (
    <>
      <ListItemIcon>
        <FolderIcon />
      </ListItemIcon>
      <ListItemText primary={file.name} />
    </>
  )
}

const StyledListItem = styled(ListItem)`
  padding: 0;
`

const renderFile = (file: FileEntity) => {
  if (file.type === "plan") return <PlanItem id={file.id} />
  if (file.type === "folder") return <FolderItem file={file} />
  return <>{file.type}</>
}

type FileListItemProps = {
  className?: string
  file: FileEntity

  onOpen?: () => void
  onMove?: (dragId: string, dropId: string) => void
  onCopy?: () => void
  onRemove?: () => void
}

const FileListItem = React.forwardRef<HTMLElement, FileListItemProps>(
  ({ className, file, onOpen, onCopy, onRemove }, ref) => {
    return (
      <StyledListItem className={className} innerRef={ref} onClick={onOpen} button divider>
        {renderFile(file)}
        <FileAction onClick={(e) => e.stopPropagation()}>
          <CopyButton onClick={onCopy} />
          <UnarchiveButton />
          <ShareButton />
          <RemoveButton onClick={onRemove} />
        </FileAction>
      </StyledListItem>
    )
  }
)

const StyledFileListItem = styled(FileListItem)`
  height: 48px;
  .MuiIconButton-root {
    display: none;
  }
  :hover .MuiIconButton-root {
    display: initial;
  }

  &.dragging {
    opacity: 0.3;
  }

  &.droppable {
    border-bottom: solid 1px;
  }
`

const DraggableFileListItem: React.FC<FileListItemProps> = (props) => {
  const { file, onMove } = props
  const item = { type: "file", file }

  const dragRef = useDrag({ item, dragLayer: <StyledFileListItem {...props} /> })

  const dropRef = useDrop({
    accept: item.type,
    canDrop: (dragItem: typeof item) => dragItem.file !== file,
    drop: (dragItem) => onMove?.(dragItem.file.id, file.id),
  })

  const handleRef = useForkRef(dragRef, dropRef)

  return <StyledFileListItem ref={handleRef} {...props} />
}

type ConnectedProps = {
  id: string
  parent: string
}

const FileListItemConnected: React.FC<ConnectedProps> = ({ id, parent }) => {
  const dispatch = useDispatch()
  const file = useSelector((state) => filesSelectors.selectById(state, id))

  const handleMove = (id: string, to: string) => {
    dispatch(filesSlice.actions.move({ id, to }))
  }

  if (!file) return null

  const handleOpen = () => {
    dispatch(appSlice.actions.openFile(id))
  }

  const handleCopy = () => {
    dispatch(copyFile(id, parent))
  }

  const handleRemove = () => {
    dispatch(removeFile(id))
  }

  return (
    <>
      <DraggableFileListItem
        file={file}
        onOpen={handleOpen}
        onMove={handleMove}
        onCopy={handleCopy}
        onRemove={handleRemove}
      />
    </>
  )
}

export default FileListItemConnected
