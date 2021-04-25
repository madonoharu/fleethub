import React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  filesSelectors,
  openDefaultFile,
  selectAppState,
} from "../../../store";
import { DirectoryBreadcrumbs } from "../../organisms";
import FolderPage from "../FolderPage";
import PlanScreen from "../PlanScreen";

const FileViewer: React.FC = () => {
  const dispatch = useDispatch();

  const file = useSelector((state) => {
    const { fileId } = selectAppState(state);
    return fileId && filesSelectors.selectById(state, fileId);
  });

  React.useEffect(() => {
    if (file) return;
    dispatch(openDefaultFile());
  }, [dispatch, file]);

  if (!file) return null;

  return (
    <>
      <DirectoryBreadcrumbs file={file} />
      {file.type === "plan" ? (
        <PlanScreen id={file.id} />
      ) : (
        <FolderPage id={file.id} />
      )}
    </>
  );
};

export default FileViewer;
