import styled from "@emotion/styled";
import { Link } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";

import { FileEntity } from "../../../store";

type FileLinkProps = {
  file: FileEntity;
  onClick: (id: string) => void;
};

const FileLink: React.FCX<FileLinkProps> = ({ className, file, onClick }) => {
  const handleClick = () => onClick(file.id);

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
