/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useForkRef } from "@mui/material";
import React from "react";

import { useDrag } from "../../../hooks";
import { FileEntity, FileType } from "../../../store";
import { useFileDrop } from "../FileDropZone";

const Container = styled.div<{ $type: FileType }>(
  ({ theme, $type }) => css`
    &.dragging {
      opacity: 0.3;
    }

    &.droppable {
      ${$type === "plan"
        ? css`
            border-bottom: solid 2px ${theme.colors.droppable};
            margin-bottom: -2px;
          `
        : css`
            outline: dashed 2px ${theme.colors.droppable};
          `}
    }
  `
);

export type DraggableFileProps = {
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
