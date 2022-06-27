import { Stack } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useAsyncOnPublish } from "../../../hooks";
import { FileEntity } from "../../../store";
import { FolderIcon, PlanIcon } from "../../atoms";
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
    <Stack className={className} gap={1}>
      <Stack direction="row" gap={1}>
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
          onClick={asyncOnPublish.onUrlCopy}
        />
        <FileCopyButton title={t("Copy")} onClick={onCopy} />
        <DeleteButton title={t("Remove")} onClick={onRemove} />

        {isTemp && <SaveButton title={t("Save")} onClick={onSave} />}
      </Stack>

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
    </Stack>
  );
};

export default FileForm;
