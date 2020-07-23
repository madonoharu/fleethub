import React from "react"
import styled from "styled-components"
import { useSelector } from "react-redux"

import { Typography, ListItem, ListItemIcon, ListItemText } from "@material-ui/core"

import { plansSelectors, FileEntity, FolderEntity } from "../../../store"
import { useFhSystem, useFile } from "../../../hooks"

import { ShipBanner, ShareButton, CopyButton, RemoveButton } from "../../molecules"
import { Flexbox, PlanIcon, FolderIcon } from "../../atoms"
import { DraggableFile } from "../../organisms"

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
        <PlanIcon />
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
    return (
      <StyledListItem className={className} innerRef={ref} onClick={onOpen} button divider>
        {renderFile(file)}
        <FileAction onClick={(e) => e.stopPropagation()}>
          <CopyButton onClick={onCopy} />
          <ShareButton />
          <RemoveButton onClick={onRemove} />
        </FileAction>
      </StyledListItem>
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
