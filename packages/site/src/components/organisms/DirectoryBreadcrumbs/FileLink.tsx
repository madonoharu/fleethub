import styled from "@emotion/styled";
import { Link } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";

import { appSlice, FileEntity } from "../../../store";

type FileLinkProps = {
  file: FileEntity;
};

const FileLink: React.FCX<FileLinkProps> = ({ className, file }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(appSlice.actions.openFile(file.id));
  };

  return (
    <Link className={className} color="inherit" noWrap onClick={handleClick}>
      {file.name || ""}
    </Link>
  );
};

export default styled(FileLink)`
  display: block;
  max-width: 120px;
`;
