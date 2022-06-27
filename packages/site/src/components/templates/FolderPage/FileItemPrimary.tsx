import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import React from "react";

import { FileEntity } from "../../../store";

type FileItemPrimaryProps = {
  file: FileEntity;
};

const FileItemPrimary: React.FCX<FileItemPrimaryProps> = ({
  className,
  file,
}) => {
  return (
    <div className={className}>
      <Typography variant="subtitle1">{file.name}</Typography>
      <Typography variant="caption">{file.description}</Typography>
    </div>
  );
};

export default styled(FileItemPrimary)(
  ({ theme }) => css`
    span {
      font-size: 0.75rem;
      color: ${theme.palette.text.secondary};
    }

    > * {
      display: block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  `
);
