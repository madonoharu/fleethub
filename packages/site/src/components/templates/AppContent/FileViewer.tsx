/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import React from "react";
import { useSelector } from "react-redux";

import { filesSelectors, selectAppState } from "../../../store";
import { DirectoryBreadcrumbs } from "../../organisms";
import FolderPage from "../FolderPage";
import PlanScreen from "../PlanScreen";
import WelcomePage from "../WelcomePage";

const StyledDirectoryBreadcrumbs = styled(DirectoryBreadcrumbs)`
  margin-left: 8px;
  min-height: 24px;
`;

const FileViewer: React.FC = () => {
  const file = useSelector((state) => {
    const { fileId } = selectAppState(state);
    if (!fileId) return;
    return filesSelectors.selectById(state, fileId);
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
