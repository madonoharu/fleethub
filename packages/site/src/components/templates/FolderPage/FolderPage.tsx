import styled from "@emotion/styled";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import { Button, Container } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFile } from "../../../hooks";
import { Flexbox } from "../../atoms";
import { FileDropZone, FileForm } from "../../organisms";
import FolderPageItem from "./FolderPageItem";

const ListContainer = styled.div`
  margin-top: 16px;
`;

type FolderPageProps = {
  id: string;
};

const FolderPage: React.FCX<FolderPageProps> = ({ className, id }) => {
  const { file, actions, canDrop } = useFile(id);
  const { t } = useTranslation("common");

  if (file?.type !== "folder") return null;

  const handlePlanCreate = () => {
    actions.createPlan();
  };

  const handleFolderCreate = () => {
    actions.createFolder();
  };

  return (
    <FileDropZone className={className} onDrop={actions.drop} canDrop={canDrop}>
      <Container>
        <FileForm
          file={file}
          onNameChange={actions.setName}
          onDescriptionChange={actions.setDescription}
          onCopy={actions.copy}
          onRemove={actions.remove}
        />

        <ListContainer>
          <Flexbox gap={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePlanCreate}
              startIcon={<NoteAddIcon />}
            >
              {t("CreateComposition")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFolderCreate}
              startIcon={<CreateNewFolderIcon />}
            >
              {t("CreateFolder")}
            </Button>
          </Flexbox>

          {file.children.map((id) => (
            <FolderPageItem key={id} id={id} parent={id} />
          ))}
        </ListContainer>
      </Container>
    </FileDropZone>
  );
};

export default styled(FolderPage)`
  height: 100%;
`;
