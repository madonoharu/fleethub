import styled from "@emotion/styled";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Breadcrumbs } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFile } from "../../../hooks";
import { FileEntity } from "../../../store";

import FileLink from "./FileLink";

interface Props {
  file: FileEntity;
}

const DirectoryBreadcrumbs: React.FCX<Props> = ({ className, file }) => {
  const { t } = useTranslation("common");
  const { parents, isTemp } = useFile(file.id);

  return (
    <Breadcrumbs
      className={className}
      separator={<NavigateNextIcon fontSize="small" />}
    >
      {isTemp && <div>{t("Temp")}</div>}
      {parents.concat(file).map((file) => (
        <FileLink key={file.id} file={file} />
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
