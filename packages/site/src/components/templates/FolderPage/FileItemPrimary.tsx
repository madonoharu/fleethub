import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import React from "react";

import { FileEntity } from "../../../store";
import { Flexbox } from "../../atoms";

type FileItemPrimaryProps = {
  file: FileEntity;
};

const FileItemPrimary: React.FCX<FileItemPrimaryProps> = ({
  className,
  file,
}) => {
  return (
    <Flexbox className={className}>
      <Typography variant="subtitle1">{file.name}</Typography>
      <Typography variant="caption">{file.description}</Typography>
    </Flexbox>
  );
};

export default styled(FileItemPrimary)(
  ({ theme }) => css`
    align-items: baseline;

    h6 {
      width: 160px;
      flex-shrink: 0;
    }

    span {
      font-size: 0.75rem;
      color: ${theme.palette.text.secondary};
    }

    > * {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  `
);
