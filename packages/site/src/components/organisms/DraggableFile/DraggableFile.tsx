import { useForkRef } from "@mui/material";
import React from "react";

import { useDrag } from "../../../hooks";
import { FileEntity, FileType } from "../../../store";
import { useFileDrop } from "../FileDropZone";
import { cn } from "../../../styles";

const Container = ({
  $type,
  className,
  ...props
}: React.ComponentProps<"div"> & { $type: FileType }) => (
  <div
    {...props}
    className={cn(
      "[&.dragging]:opacity-30",
      $type === "plan"
        ? "[&.droppable]:border-b-2 [&.droppable]:border-b-solid [&.droppable]:border-droppable [&.droppable]:-mb-0.5"
        : "[&.droppable]:outline-2 [&.droppable]:outline-dashed [&.droppable]:outline-droppable",
      className,
    )}
  />
);

export type DraggableFileProps = {
  children: React.ReactNode;
  file: FileEntity;
  canDrop: (dragFile: FileEntity) => boolean;
  onDrop: (dragFile: FileEntity) => void;
};

const DraggableFile: React.FCX<DraggableFileProps> = ({
  className,
  file,
  canDrop,
  onDrop,
  children,
}) => {
  const element = (
    <Container className={className} tabIndex={0} $type={file.type}>
      {children}
    </Container>
  );

  const item = {
    file,
  };

  const dragRef = useDrag({
    type: "file",
    item,
    dragLayer: element,
  });

  const dropRef = useFileDrop({ canDrop, onDrop });

  const ref = useForkRef(dragRef, dropRef);

  return React.cloneElement(element, { ref });
};

export default DraggableFile;
