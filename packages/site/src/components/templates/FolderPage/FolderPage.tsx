import styled from "@emotion/styled";
import { Button, Container } from "@material-ui/core";
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder";
import NoteAddIcon from "@material-ui/icons/NoteAdd";
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
              編成を作成
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFolderCreate}
              startIcon={<CreateNewFolderIcon />}
            >
              フォルダを作成
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
