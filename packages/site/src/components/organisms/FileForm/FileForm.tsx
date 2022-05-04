import { useTranslation } from "next-i18next";
import React from "react";

import { useAsyncOnPublish } from "../../../hooks";
import { FileEntity } from "../../../store";
import { Flexbox, FolderIcon, PlanIcon } from "../../atoms";
import {
  FileCopyButton,
  DeleteButton,
  SaveButton,
  TextField,
  LinkButton,
} from "../../molecules";

type FileFormProps = {
  file: FileEntity;
  isTemp: boolean;
  onSave: () => void;
  onCopy: () => void;
  onRemove: () => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (name: string) => void;
};

const FileForm: React.FCX<FileFormProps> = ({
  className,
  file,
  isTemp,
  onSave,
  onCopy,
  onRemove,
  onNameChange,
  onDescriptionChange,
}) => {
  const { t } = useTranslation("common");
  const icon = file.type === "folder" ? <FolderIcon /> : <PlanIcon />;

  const asyncOnPublish = useAsyncOnPublish(file.id);

  return (
    <div className={className}>
      <Flexbox gap={1}>
        <TextField
          placeholder="name"
          fullWidth
          startLabel={icon}
          value={file.name}
          onChange={onNameChange}
        />
        <LinkButton
          title={t("CopySharedLinkToClipboard") || ""}
          disabled={asyncOnPublish.loading}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={asyncOnPublish.onUrlCopy}
        />
        <FileCopyButton title={t("Copy")} onClick={onCopy} />
        <DeleteButton title={t("Remove")} onClick={onRemove} />

        {isTemp && <SaveButton title={t("Save")} onClick={onSave} />}
      </Flexbox>

      <TextField
        label={t("Description")}
        variant="outlined"
        fullWidth
        maxRows={6}
        value={file.description}
        onChange={onDescriptionChange}
        multiline
      />

      <asyncOnPublish.Snackbar />
    </div>
  );
};

export default FileForm;
