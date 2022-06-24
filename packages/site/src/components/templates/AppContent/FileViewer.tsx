import styled from "@emotion/styled";
import React from "react";

import { useRootSelector } from "../../../hooks";
import { filesSelectors } from "../../../store";
import { DirectoryBreadcrumbs } from "../../organisms";
import FolderPage from "../FolderPage";
import PlanScreen from "../PlanScreen";
import WelcomePage from "../WelcomePage";

const StyledDirectoryBreadcrumbs = styled(DirectoryBreadcrumbs)`
  margin-left: 8px;
  min-height: 24px;
`;

const FileViewer: React.FC = () => {
  const file = useRootSelector((root) => {
    const { fileId } = root.app;
    if (!fileId) return;
    return filesSelectors.selectById(root, fileId);
  });

  if (!file) return <WelcomePage />;

  return (
    <>
      <StyledDirectoryBreadcrumbs file={file} />
      {file.type === "plan" ? (
        <PlanScreen id={file.id} />
      ) : (
        <FolderPage id={file.id} />
      )}
    </>
  );
};

export default FileViewer;
