import { Typography } from "@mui/material";
import React from "react";

import { cn } from "../../../styles/cn";
import { FileEntity } from "../../../store";

type FileItemPrimaryProps = {
  file: FileEntity;
};

const FileItemPrimary: React.FCX<FileItemPrimaryProps> = ({ className, file }) => {
  return (
    <div
      className={cn(
        "[&>*]:block [&>*]:overflow-hidden [&>*]:whitespace-nowrap [&>*]:text-ellipsis",
        className,
      )}
    >
      <Typography variant="subtitle1">{file.name}</Typography>
      <Typography className="text-[0.75rem] text-text-secondary" variant="caption">
        {file.description}
      </Typography>
    </div>
  );
};

export default FileItemPrimary;
