import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem, type TreeItemProps } from "@mui/x-tree-view/TreeItem";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
import { useAppDispatch, useRootSelector } from "../../../hooks";
import { appSlice, FileEntity, filesSlice, isFolder, entitiesSlice } from "../../../store";
import { FileDropZone } from "../../organisms";

import ExplorerHeader from "./ExplorerHeader";
import FolderLabel from "./FolderLabel";
import PlanLabel from "./PlanLabel";

const treeItemSlotProps: TreeItemProps["slotProps"] = {
  content: { className: "p-0" },
  groupTransition: { className: "pl-3", timeout: 150 },
  label: { className: "min-w-0 shrink overflow-visible" },
};

const Explorer: React.FCX = ({ className }) => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();

  const { rootIds, tempIds, entities } = useRootSelector((root) => root.entities.files);

  const [expanded, setExpanded] = React.useState<string[]>(["root", "temp"]);
  const [selected, setSelected] = React.useState<string>("");

  const toggleExplorerOpen = () => dispatch(appSlice.actions.toggleExplorerOpen());

  const handleSelectedItemsChange = (_: React.SyntheticEvent | null, id: string | null) => {
    setSelected(id || "");
  };

  const handleExpandedItemsChange = (_: React.SyntheticEvent | null, itemIds: string[]) => {
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
      <TreeItem key={file.id} itemId={file.id} label={label} slotProps={treeItemSlotProps}>
        {children}
      </TreeItem>
    );
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <ExplorerHeader
        onPlanCreate={handlePlanCreate}
        onFolderCreate={handleFolderCreate}
        onClose={toggleExplorerOpen}
      />

      <SimpleTreeView<false>
        // MUI also adds MuiSimpleTreeView-root to each TreeItem. Apply scrolling
        // directly to this element so individual rows never become scroll areas.
        className="min-h-0 overflow-auto"
        itemChildrenIndentation={12}
        slots={{
          collapseIcon: ExpandMoreIcon,
          expandIcon: ChevronRightIcon,
        }}
        expandedItems={expanded}
        selectedItems={selected}
        onSelectedItemsChange={handleSelectedItemsChange}
        onExpandedItemsChange={handleExpandedItemsChange}
      >
        <TreeItem key="root" itemId="root" label={"root"} slotProps={treeItemSlotProps}>
          {rootIds.map(renderFile)}
          <FileDropZone className="h-[40px]" onDrop={handleRootDrop} />
        </TreeItem>
        <TreeItem key="temp" itemId="temp" label={t("Temp")} slotProps={treeItemSlotProps}>
          {tempIds.map(renderFile)}
        </TreeItem>
      </SimpleTreeView>
    </div>
  );
};

export default Explorer;
