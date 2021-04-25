import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Button, Container } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder";
import React from "react";

import { useDrop } from "../../../hooks";
import { FileEntity } from "../../../store";

type FileItem = {
  type: "file";
  file: FileEntity;
};

export type FileDropZoneProps = {
  canDrop: (dragFile: FileEntity) => boolean;
  onDrop: (dragFile: FileEntity) => void;
};

export const useFileDrop = ({ canDrop, onDrop }: FileDropZoneProps) => {
  return useDrop({
    accept: "file",
    canDrop: (item: FileItem) => canDrop(item.file),
    drop: (item: FileItem, monitor) => {
      if (monitor.getDropResult() === null) onDrop(item.file);
    },
  });
};

const FileDropZone: React.FCX<FileDropZoneProps> = ({
  className,
  canDrop,
  onDrop,
  children,
}) => {
  const ref = useFileDrop({ canDrop, onDrop });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default FileDropZone;
