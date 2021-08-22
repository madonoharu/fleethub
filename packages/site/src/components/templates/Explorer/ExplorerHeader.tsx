import { Button } from "@material-ui/core";
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder";
import NoteAddIcon from "@material-ui/icons/NoteAdd";
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
  return (
    <Flexbox className={className}>
      <Button onClick={onPlanCreate} startIcon={<NoteAddIcon />}>
        編成を作成
      </Button>
      <Button onClick={onFolderCreate} startIcon={<CreateNewFolderIcon />}>
        フォルダを作成
      </Button>
      <ClearButton
        css={{ marginLeft: "auto" }}
        title="一覧を閉じる"
        size="small"
        onClick={onClose}
      />
    </Flexbox>
  );
};

export default ExplorerHeader;
