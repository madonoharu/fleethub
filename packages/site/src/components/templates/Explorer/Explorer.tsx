import styled from "@emotion/styled";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TreeItem from "@mui/lab/TreeItem";
import TreeView from "@mui/lab/TreeView";
import React from "react";

import { useAppDispatch, useAppSelector } from "../../../hooks";
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

const TransitionProps = { timeout: 150 };

const Explorer: React.FCX = ({ className }) => {
  const dispatch = useAppDispatch();

  const { rootIds, tempIds, entities } = useAppSelector(
    (root) => root.present.entities.files
  );

  const [expanded, setExpanded] = React.useState<string[]>(["root", "temp"]);
  const [selected, setSelected] = React.useState<string>("");

  const toggleExplorerOpen = () =>
    dispatch(appSlice.actions.toggleExplorerOpen());

  const handleToggle = (e: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (e: React.SyntheticEvent, id: string) => {
    setSelected(id);
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
        nodeId={file.id}
        label={label}
        TransitionProps={TransitionProps}
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

      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
      >
        <TreeItem
          key="root"
          nodeId="root"
          label={"root"}
          TransitionProps={TransitionProps}
        >
          {rootIds.map(renderFile)}
          <FileDropZone css={{ height: 8 * 5 }} onDrop={handleRootDrop} />
        </TreeItem>
        <TreeItem
          key="temp"
          nodeId="temp"
          label="temp"
          TransitionProps={TransitionProps}
        >
          {tempIds.map(renderFile)}
        </TreeItem>
      </TreeView>
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

  .MuiTreeItem-label {
    min-width: 0;
    flex-shrink: 1;
  }

  .MuiTreeItem-group {
    margin-left: 12px;
  }
`;
