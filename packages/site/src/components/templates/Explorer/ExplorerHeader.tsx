import { Button } from "@material-ui/core";
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder";
import NoteAddIcon from "@material-ui/icons/NoteAdd";
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
