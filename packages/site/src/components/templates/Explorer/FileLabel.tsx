import styled from "@emotion/styled";
import React from "react";

import { Flexbox, FileIcon } from "../../atoms";
import { DraggableFile, DraggableFileProps } from "../../organisms";

const FileLabelAction = styled.div`
  flex-shrink: 0;
  display: none;
`;

const FileLabelText = styled.span`
  flex-shrink: 1;
  flex-grow: 1;
  margin: 0 8px;
  font-size: 0.75rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export type FileLabelProps = {
  text: React.ReactNode;
  action: React.ReactNode;
  onClick?: () => void;
} & Omit<DraggableFileProps, "children">;

const handleActionClick = (event: React.MouseEvent) => event.stopPropagation();

const FileLabel: React.FCX<FileLabelProps> = ({
  className,
  text,
  action,
  onClick,
  file,
  canDrop,
  onDrop,
}) => {
  return (
    <DraggableFile file={file} canDrop={canDrop} onDrop={onDrop}>
      <Flexbox className={className} onClick={onClick}>
        <FileIcon fontSize="small" type={file.type} color={file.color} />
        <FileLabelText>{text}</FileLabelText>
        <FileLabelAction onClick={handleActionClick}>{action}</FileLabelAction>
      </Flexbox>
    </DraggableFile>
  );
};

export default styled(FileLabel)`
  height: 24px;

  :hover > div:last-of-type {
    display: block;
  }
`;
