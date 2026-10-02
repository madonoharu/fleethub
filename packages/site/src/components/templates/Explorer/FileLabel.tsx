import React from "react";

import { cn } from "../../../styles/cn";
import { Flexbox, FileIcon } from "../../atoms";
import { DraggableFile, DraggableFileProps } from "../../organisms";

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
      <Flexbox className={cn("h-6 [&:hover>div:last-of-type]:block", className)} onClick={onClick}>
        <FileIcon fontSize="small" type={file.type} color={file.color} />
        <span className="mx-2 grow shrink overflow-hidden text-[0.75rem] text-ellipsis whitespace-nowrap">
          {text}
        </span>
        <div className="hidden shrink-0" onClick={handleActionClick}>
          {action}
        </div>
      </Flexbox>
    </DraggableFile>
  );
};

export default FileLabel;
