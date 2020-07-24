import React from "react"
import styled from "styled-components"

import { Typography, ListItem, ListItemIcon, ListItemText } from "@material-ui/core"

import { FileEntity, FolderEntity } from "../../../store"
import { useFile, usePlanFile, useModal } from "../../../hooks"

import { ShipBanner, ShareButton, CopyButton, RemoveButton, MoreVertButton } from "../../molecules"
import { Flexbox, PlanIcon, FolderIcon } from "../../atoms"
import { DraggableFile, FileMenu } from "../../organisms"

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
  const { plan, file, actions } = usePlanFile(id)
  if (!plan || !file) return null

  return (
    <>
      <ListItemIcon>
        <PlanIcon />
      </ListItemIcon>
      <PlanName noWrap>{file.name}</PlanName>
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
