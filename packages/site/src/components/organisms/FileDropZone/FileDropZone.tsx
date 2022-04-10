import React from "react";

import { useDrop } from "../../../hooks";
import { FileEntity } from "../../../store";

type FileItem = {
  type: "file";
  file: FileEntity;
};

export type FileDropZoneProps = {
  children?: React.ReactNode;
  onDrop: (dragFile: FileEntity) => void;
  canDrop?: (dragFile: FileEntity) => boolean;
};

export const useFileDrop = ({
  canDrop,
  onDrop,
}: Pick<FileDropZoneProps, "canDrop" | "onDrop">) => {
  return useDrop({
    accept: "file",
    canDrop: canDrop && ((item: FileItem) => canDrop(item.file)),
    drop: (item: FileItem, monitor) => {
      if (monitor.getDropResult() === null) onDrop(item.file);
    },
  });
};

const FileDropZone: React.FCX<FileDropZoneProps> = ({
  className,
  style,
  canDrop,
  onDrop,
  children,
}) => {
  const ref = useFileDrop({ canDrop, onDrop });

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};

export default FileDropZone;
