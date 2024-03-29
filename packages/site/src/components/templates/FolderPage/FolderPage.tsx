import styled from "@emotion/styled";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import { Button, Container, Stack } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFile } from "../../../hooks";
import { FileDropZone, FileForm } from "../../organisms";

import FolderPageItem from "./FolderPageItem";

const ListContainer = styled.div`
  margin-top: 16px;
`;

type FolderPageProps = {
  id: string;
};

const FolderPage: React.FCX<FolderPageProps> = ({ className, id }) => {
  const { file, actions, isTemp, canDrop } = useFile(id);
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
          isTemp={isTemp}
          onNameChange={actions.setName}
          onDescriptionChange={actions.setDescription}
          onColorChange={actions.setColor}
          onSave={actions.save}
          onCopy={actions.copy}
          onRemove={actions.remove}
        />

        <Stack direction="row" gap={1} mt={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePlanCreate}
            startIcon={<NoteAddIcon />}
          >
            {t("CreateComp")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFolderCreate}
            startIcon={<CreateNewFolderIcon />}
          >
            {t("CreateFolder")}
          </Button>
        </Stack>

        <ListContainer>
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
