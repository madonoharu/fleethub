import { ListItemIcon, ListItemText, ListItemButton } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
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
        secondary={<ShipBannerGroup main={org.main_ship_ids()} escort={org.escort_ship_ids()} />}
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
      <ListItemText disableTypography primary={<FileItemPrimary file={file} />} />
    </>
  );
};

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
      <ListItemButton
        className={cn(
          "min-h-14 px-2 py-0 [&_.MuiIconButton-root]:hidden [&:hover_.MuiIconButton-root]:[display:initial] [&.dragging]:opacity-30 [&.droppable]:border-b [&.droppable]:border-solid [&.droppable]:border-b-current",
          className,
        )}
        divider
        onClick={onOpen}
      >
        {renderFile(file)}
        <Flexbox className="ml-auto [&>*]:h-10" onClick={(e) => e.stopPropagation()}>
          <FileCopyButton size="medium" title={t("Copy")} onClick={onCopy} />
          <DeleteButton size="medium" title={t("Remove")} onClick={onRemove} />
          <MoreVertButton size="medium" title="メニューを開く" onClick={MenuModal.show} />
        </Flexbox>
      </ListItemButton>

      <MenuModal>
        <FileMenu id={file.id} onClose={MenuModal.hide} />
      </MenuModal>
    </>
  );
};

type ConnectedProps = {
  id: string;
  parent: string;
};

const FolderPageItemConnected: React.FC<ConnectedProps> = ({ id }) => {
  const { file, actions, canDrop } = useFile(id);

  if (!file) return null;

  return (
    <DraggableFile file={file} canDrop={canDrop} onDrop={actions.drop}>
      <FolderPageItem
        file={file}
        onOpen={actions.open}
        onCopy={actions.copy}
        onRemove={actions.remove}
      />
    </DraggableFile>
  );
};

export default FolderPageItemConnected;
