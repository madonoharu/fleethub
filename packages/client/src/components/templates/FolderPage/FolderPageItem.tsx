import React from "react"
import styled from "@emotion/styled"

import { Typography, ListItem, ListItemIcon, ListItemText } from "@material-ui/core"

import { FileEntity, FolderEntity, PlanFileEntity } from "../../../store"
import { useFile, useFhPlan, useModal } from "../../../hooks"

import { ShipBanner, CopyButton, RemoveButton, MoreVertButton } from "../../molecules"
import { Flexbox, PlanIcon, FolderIcon } from "../../atoms"
import { DraggableFile, FileMenu } from "../../organisms"

import FileItemPrimary from "./FileItemPrimary"

const ShipsContainer = styled.div`
  overflow: hidden;
  white-space: nowrap;

  line-height: 0;
  > * {
    margin-bottom: 4px;
  }
`

const FileAction = styled(Flexbox)`
  margin-left: auto;
`

const PlanItem: React.FC<{ file: PlanFileEntity }> = ({ file }) => {
  const plan = useFhPlan(file.id)
  if (!plan) return null

  return (
    <>
      <ListItemIcon>
        <PlanIcon />
      </ListItemIcon>
      <ListItemText
        disableTypography
        primary={<FileItemPrimary file={file} />}
        secondary={
          <ShipsContainer>
            <div>
              {plan.main.ships.map((ship, index) => (
                <ShipBanner key={index} publicId={ship.banner} />
              ))}
            </div>
            <div>
              {plan.escort?.ships.map((ship, index) => (
                <ShipBanner key={index} publicId={ship.banner} />
              ))}
            </div>
          </ShipsContainer>
        }
      />
    </>
  )
}

const FolderItem: React.FC<{ file: FolderEntity }> = ({ file }) => {
  return (
    <>
      <ListItemIcon>
        <FolderIcon />
      </ListItemIcon>
      <ListItemText disableTypography primary={<FileItemPrimary file={file} />} />
    </>
  )
}

const StyledListItem = styled(ListItem)`
  padding: 0;
`

const renderFile = (file: FileEntity) => {
  if (file.type === "plan") return <PlanItem file={file} />
  return <FolderItem file={file} />
}

type FolderPageItemProps = {
  className?: string
  file: FileEntity

  onOpen?: () => void
  onCopy?: () => void
  onRemove?: () => void
}

const FolderPageItem = React.forwardRef<HTMLElement, FolderPageItemProps>(
  ({ className, file, onOpen, onCopy, onRemove }, ref) => {
    const MenuModal = useModal()

    return (
      <>
        <StyledListItem className={className} innerRef={ref} onClick={onOpen} button divider>
          {renderFile(file)}
          <FileAction onClick={(e) => e.stopPropagation()}>
            <CopyButton title="コピーする" onClick={onCopy} />
            <RemoveButton title="削除する" onClick={onRemove} />
            <MoreVertButton title="メニューを開く" onClick={MenuModal.show} />
          </FileAction>
        </StyledListItem>

        <MenuModal>
          <FileMenu id={file.id} onClose={MenuModal.hide} />
        </MenuModal>
      </>
    )
  }
)

const StyledFolderPageItem = styled(FolderPageItem)`
  min-height: 56px;
  padding: 0 8px;

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

type ConnectedProps = {
  id: string
  parent: string
}

const FolderPageItemConnected: React.FC<ConnectedProps> = ({ id, parent }) => {
  const { file, actions, canDrop } = useFile(id)

  if (!file) return null

  return (
    <DraggableFile file={file} canDrop={canDrop} onDrop={actions.drop}>
      <StyledFolderPageItem file={file} onOpen={actions.open} onCopy={actions.copy} onRemove={actions.remove} />
    </DraggableFile>
  )
}

export default FolderPageItemConnected
