/** @jsxImportSource @emotion/react */
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import { Button } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { Flexbox } from "../../atoms";
import { ClearButton } from "../../molecules";

type ExplorerHeaderProps = {
  onPlanCreate: () => void;
  onFolderCreate: () => void;
  onClose: () => void;
};

const ExplorerHeader: React.FCX<ExplorerHeaderProps> = ({
  className,
  onClose,
  onPlanCreate,
  onFolderCreate,
}) => {
  const { t } = useTranslation("common");
  return (
    <Flexbox className={className}>
      <Button onClick={onPlanCreate} startIcon={<NoteAddIcon />}>
        {t("CreateComposition")}
      </Button>
      <Button onClick={onFolderCreate} startIcon={<CreateNewFolderIcon />}>
        {t("CreateFolder")}
      </Button>
      <ClearButton
        css={{ marginLeft: "auto" }}
        title={t("Close")}
        size="small"
        onClick={onClose}
      />
    </Flexbox>
  );
};

export default ExplorerHeader;
