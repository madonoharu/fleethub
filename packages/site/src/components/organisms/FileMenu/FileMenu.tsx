import styled from "@emotion/styled";
import React from "react";

import { useFile } from "../../../hooks";
import FileForm from "../FileForm";
import FolderMenu from "./FolderMenu";
import PlanMenu from "./PlanMenu";

type Props = {
  id: string;
  onClose?: () => void;
};

const FileMenu: React.FCX<Props> = ({ className, id, onClose }) => {
  const { file, actions } = useFile(id);

  if (!file) return null;

  const handleCopy = () => {
    actions.copy();
    onClose?.();
  };

  const handleRemove = () => {
    actions.remove();
    onClose?.();
  };

  return (
    <div className={className}>
      <FileForm
        file={file}
        onCopy={handleCopy}
        onRemove={handleRemove}
        onNameChange={actions.setName}
        onDescriptionChange={actions.setDescription}
      />

      {file.type === "folder" ? (
        <FolderMenu file={file} />
      ) : (
        <PlanMenu file={file} />
      )}
    </div>
  );
};

export default styled(FileMenu)`
  min-height: 400px;
  width: 400px;
  padding: 8px;
`;
