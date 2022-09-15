import PaletteIcon from "@mui/icons-material/Palette";
import { Button, Stack } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useAsyncOnPublish, useModal } from "../../../hooks";
import { FileEntity } from "../../../store";
import { FileIcon } from "../../atoms";
import {
  FileCopyButton,
  DeleteButton,
  SaveButton,
  TextField,
  LinkButton,
} from "../../molecules";

import ColorPicker from "./ColorPicker";

type FileFormProps = {
  file: FileEntity;
  isTemp: boolean;
  onSave: () => void;
  onCopy: () => void;
  onRemove: () => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onColorChange: (color: string) => void;
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
  onColorChange,
}) => {
  const { t } = useTranslation("common");

  const asyncOnPublish = useAsyncOnPublish(file.id);
  const ColorPickerModal = useModal();

  const handleColorChange = (color: string) => {
    onColorChange(color);
    ColorPickerModal.hide();
  };

  return (
    <Stack className={className} gap={1}>
      <Stack direction="row" gap={1}>
        <TextField
          placeholder="name"
          fullWidth
          startLabel={<FileIcon type={file.type} color={file.color} />}
          value={file.name}
          onChange={onNameChange}
        />
        <LinkButton
          size="medium"
          title={t("CopySharedLinkToClipboard") || ""}
          disabled={asyncOnPublish.loading}
          onClick={asyncOnPublish.onUrlCopy}
        />
        <FileCopyButton size="medium" title={t("Copy")} onClick={onCopy} />
        <DeleteButton size="medium" title={t("Remove")} onClick={onRemove} />

        {isTemp && (
          <SaveButton size="medium" title={t("Save")} onClick={onSave} />
        )}
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

      <Button
        variant="outlined"
        startIcon={<PaletteIcon />}
        onClick={ColorPickerModal.show}
        sx={{ width: "fit-content" }}
      >
        {t("ChangeIconColor")}
      </Button>

      <ColorPickerModal>
        <ColorPicker color={file.color} onChange={handleColorChange} />
      </ColorPickerModal>

      <asyncOnPublish.Snackbar />
    </Stack>
  );
};

export default FileForm;
