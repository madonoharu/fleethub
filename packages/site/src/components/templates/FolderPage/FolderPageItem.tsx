import styled from "@emotion/styled";
import { ListItemIcon, ListItemText, ListItemButton } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFile, useModal, useOrg } from "../../../hooks";
import { FileEntity, FolderEntity, PlanEntity } from "../../../store";
import { Flexbox, FileIcon } from "../../atoms";
import { FileCopyButton, MoreVertButton, DeleteButton } from "../../molecules";
import { DraggableFile, FileMenu, ShipBannerGroup } from "../../organisms";

import FileItemPrimary from "./FileItemPrimary";

const PlanItem: React.FC<{ file: PlanEntity }> = ({ file }) => {
  const { org } = useOrg(file.org);

  if (!org) return null;

  return (
    <>
      <ListItemIcon>
        <FileIcon type={file.type} color={file.color} />
      </ListItemIcon>
      <ListItemText
        disableTypography
        primary={<FileItemPrimary file={file} />}
        secondary={
          <ShipBannerGroup
            main={org.main_ship_ids()}
            escort={org.escort_ship_ids()}
          />
        }
      />
    </>
  );
};

const FolderItem: React.FC<{ file: FolderEntity }> = ({ file }) => {
  return (
    <>
      <ListItemIcon>
        <FileIcon type={file.type} color={file.color} />
      </ListItemIcon>
      <ListItemText
        disableTypography
        primary={<FileItemPrimary file={file} />}
      />
    </>
  );
};

const FileAction = styled(Flexbox)`
  margin-left: auto;
  > * {
    height: 40px;
  }
`;

const renderFile = (file: FileEntity) => {
  if (file.type === "plan") return <PlanItem file={file} />;
  return <FolderItem file={file} />;
};

type FolderPageItemProps = {
  file: FileEntity;
  onOpen?: () => void;
  onCopy?: () => void;
  onRemove?: () => void;
};

const FolderPageItem: React.FCX<FolderPageItemProps> = ({
  className,
  file,
  onOpen,
  onCopy,
  onRemove,
}) => {
  const MenuModal = useModal();
  const { t } = useTranslation("common");

  return (
    <>
      <ListItemButton className={className} divider onClick={onOpen}>
        {renderFile(file)}
        <FileAction onClick={(e) => e.stopPropagation()}>
          <FileCopyButton size="medium" title={t("Copy")} onClick={onCopy} />
          <DeleteButton size="medium" title={t("Remove")} onClick={onRemove} />
          <MoreVertButton
            size="medium"
            title="メニューを開く"
            onClick={MenuModal.show}
          />
        </FileAction>
      </ListItemButton>

      <MenuModal>
        <FileMenu id={file.id} onClose={MenuModal.hide} />
      </MenuModal>
    </>
  );
};

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
`;

type ConnectedProps = {
  id: string;
  parent: string;
};

const FolderPageItemConnected: React.FC<ConnectedProps> = ({ id }) => {
  const { file, actions, canDrop } = useFile(id);

  if (!file) return null;

  return (
    <DraggableFile file={file} canDrop={canDrop} onDrop={actions.drop}>
      <StyledFolderPageItem
        file={file}
        onOpen={actions.open}
        onCopy={actions.copy}
        onRemove={actions.remove}
      />
    </DraggableFile>
  );
};

export default FolderPageItemConnected;
