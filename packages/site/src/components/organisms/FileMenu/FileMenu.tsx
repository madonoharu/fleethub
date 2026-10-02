import React from "react";

import { useFile } from "../../../hooks";
import FileForm from "../FileForm";

import FolderMenu from "./FolderMenu";
import PlanMenu from "./PlanMenu";
import { cn } from "../../../styles";

type Props = {
  id: string;
  onClose?: () => void;
};

const FileMenu: React.FCX<Props> = ({ className, id, onClose }) => {
  const { file, actions, isTemp } = useFile(id);

  if (!file) return null;

  const handleSave = () => {
    actions.save();
    onClose?.();
  };

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
        isTemp={isTemp}
        onSave={handleSave}
        onCopy={handleCopy}
        onRemove={handleRemove}
        onNameChange={actions.setName}
        onDescriptionChange={actions.setDescription}
        onColorChange={actions.setColor}
      />

      {file.type === "folder" ? <FolderMenu file={file} /> : <PlanMenu file={file} />}
    </div>
  );
};

export default ({ className, ...props }: React.ComponentProps<typeof FileMenu>) => (
  <FileMenu {...props} className={cn("min-h-100 w-100 p-2", className)} />
);
