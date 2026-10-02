import React from "react";

import { useRootSelector } from "../../../hooks";
import { filesSelectors } from "../../../store";
import { DirectoryBreadcrumbs } from "../../organisms";
import FolderPage from "../FolderPage";
import PlanScreen from "../PlanScreen";
import WelcomePage from "../WelcomePage";

const FileViewer: React.FC = () => {
  const file = useRootSelector((root) => {
    const { fileId } = root.app;
    if (!fileId) return;
    return filesSelectors.selectById(root, fileId);
  });

  if (!file) return <WelcomePage />;

  return (
    <>
      <DirectoryBreadcrumbs className="ml-2 min-h-6" file={file} />
      {file.type === "plan" ? <PlanScreen id={file.id} /> : <FolderPage id={file.id} />}
    </>
  );
};

export default FileViewer;
