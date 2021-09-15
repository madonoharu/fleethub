import styled from "@emotion/styled";
import SaveIcon from "@mui/icons-material/Save";
import { Fab, Tooltip } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { useIsTemp } from "../../../hooks";

import { filesSelectors, filesSlice, selectAppState } from "../../../store";
import { DirectoryBreadcrumbs } from "../../organisms";
import FolderPage from "../FolderPage";
import PlanScreen from "../PlanScreen";
import WelcomePage from "../WelcomePage";

const StyledDirectoryBreadcrumbs = styled(DirectoryBreadcrumbs)`
  margin-left: 8px;
`;

const FileViewer: React.FC = () => {
  const dispatch = useDispatch();
  const file = useSelector((state) => {
    const { fileId } = selectAppState(state);
    if (!fileId) return;
    return filesSelectors.selectById(state, fileId);
  });

  const isTemp = useIsTemp(file?.id || "");

  if (!file) return <WelcomePage />;

  return (
    <>
      {isTemp && (
        <Tooltip title="保存します">
          <Fab
            color="primary"
            css={{ position: "absolute", right: 32, top: 56 }}
            onClick={() => dispatch(filesSlice.actions.move(file.id))}
          >
            <SaveIcon />
          </Fab>
        </Tooltip>
      )}
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
