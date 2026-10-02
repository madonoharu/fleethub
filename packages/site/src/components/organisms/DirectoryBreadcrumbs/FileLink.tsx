import { Link } from "@mui/material";
import React from "react";

import { useAppDispatch } from "../../../hooks";
import { appSlice, FileEntity } from "../../../store";
import { cn } from "../../../styles";

interface FileLinkProps {
  file: FileEntity;
}

const FileLink: React.FCX<FileLinkProps> = ({ className, file }) => {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    dispatch(appSlice.actions.openFile(file.id));
  };

  return (
    <Link className={className} color="inherit" noWrap onClick={handleClick}>
      {file.name || ""}
    </Link>
  );
};

export default ({ className, ...props }: React.ComponentProps<typeof FileLink>) => (
  <FileLink {...props} className={cn("block max-w-30 cursor-pointer", className)} />
);
