import styled from "@emotion/styled";
import { Breadcrumbs } from "@material-ui/core";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import React from "react";
import { useDispatch } from "react-redux";

import { useFile } from "../../../hooks";
import { appSlice, FileEntity } from "../../../store";
import FileLink from "./FileLink";

type Props = {
  file: FileEntity;
};

const DirectoryBreadcrumbs: React.FCX<Props> = ({ className, file }) => {
  const { parents } = useFile(file.id);

  const dispatch = useDispatch();
  const handleClick = (id: string) => {
    dispatch(appSlice.actions.openFile(id));
  };

  return (
    <Breadcrumbs
      className={className}
      separator={<NavigateNextIcon fontSize="small" />}
    >
      {parents.concat(file).map((file) => (
        <FileLink key={file.id} file={file} onClick={handleClick} />
      ))}
    </Breadcrumbs>
  );
};

export default styled(DirectoryBreadcrumbs)`
  .MuiBreadcrumbs-separator {
    margin: 0;
  }

  .MuiBreadcrumbs-li {
    font-size: 0.75rem;
  }
`;
