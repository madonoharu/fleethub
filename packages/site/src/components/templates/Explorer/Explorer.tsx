import styled from "@emotion/styled";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useTranslation } from "next-i18next";
import React from "react";

import { useAppDispatch, useRootSelector } from "../../../hooks";
import {
  appSlice,
  FileEntity,
  filesSlice,
  isFolder,
  entitiesSlice,
} from "../../../store";
import { FileDropZone } from "../../organisms";

import ExplorerHeader from "./ExplorerHeader";
import FolderLabel from "./FolderLabel";
import PlanLabel from "./PlanLabel";

const groupTransition = { timeout: 150 };

const Explorer: React.FCX = ({ className }) => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();

  const { rootIds, tempIds, entities } = useRootSelector(
    (root) => root.entities.files,
  );

  const [expanded, setExpanded] = React.useState<string[]>(["root", "temp"]);
  const [selected, setSelected] = React.useState<string>("");

  const toggleExplorerOpen = () =>
    dispatch(appSlice.actions.toggleExplorerOpen());

  const handleSelectedItemsChange = (
    _: React.SyntheticEvent,
    id: string | null,
  ) => {
    setSelected(id || "");
  };

  const handleExpandedItemsChange = (
    _: React.SyntheticEvent,
    itemIds: string[],
  ) => {
    setExpanded(itemIds);
  };

  const handlePlanCreate = () => {
    dispatch(entitiesSlice.actions.createPlan());
  };

  const handleFolderCreate = () => {
    dispatch(filesSlice.actions.createFolder());
  };

  const handleRootDrop = ({ id }: FileEntity) => {
    dispatch(filesSlice.actions.move(id));
  };

  const renderFile = (id: string) => {
    const file = entities[id];
    if (!file) return null;

    let label: React.ReactNode;

    if (file.type === "plan") {
      label = <PlanLabel file={file} />;
    } else if (file.type === "folder") {
      label = <FolderLabel file={file} />;
    }

    const children = isFolder(file) ? file.children.map(renderFile) : null;

    return (
      <TreeItem
        key={file.id}
        itemId={file.id}
        label={label}
        slotProps={{ groupTransition }}
      >
        {children}
      </TreeItem>
    );
  };

  return (
    <div className={className}>
      <ExplorerHeader
        onPlanCreate={handlePlanCreate}
        onFolderCreate={handleFolderCreate}
        onClose={toggleExplorerOpen}
      />

      <SimpleTreeView<false>
        slots={{
          collapseIcon: ExpandMoreIcon,
          expandIcon: ChevronRightIcon,
        }}
        expandedItems={expanded}
        selectedItems={selected}
        onSelectedItemsChange={handleSelectedItemsChange}
        onExpandedItemsChange={handleExpandedItemsChange}
      >
        <TreeItem
          key="root"
          itemId="root"
          label={"root"}
          slotProps={{ groupTransition }}
        >
          {rootIds.map(renderFile)}
          <FileDropZone css={{ height: 8 * 5 }} onDrop={handleRootDrop} />
        </TreeItem>
        <TreeItem
          key="temp"
          itemId="temp"
          label={t("Temp")}
          slotProps={{ groupTransition }}
        >
          {tempIds.map(renderFile)}
        </TreeItem>
      </SimpleTreeView>
    </div>
  );
};

export default styled(Explorer)`
  display: flex;
  flex-direction: column;
  height: 100%;

  .MuiTreeView-root {
    overflow: scroll;
  }

  .MuiTreeItem-content {
    padding: 0;
  }

  .MuiTreeItem-label {
    min-width: 0;
    flex-shrink: 1;
  }

  .MuiTreeItem-group {
    margin-left: 12px;
  }
`;
