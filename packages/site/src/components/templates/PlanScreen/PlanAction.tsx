import SaveIcon from "@mui/icons-material/Save";
import { Fab } from "@mui/material";
import { Org } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useAsyncOnPublish, useFile, useModal } from "../../../hooks";
import { PlanEntity } from "../../../store";
import { openKctools } from "../../../utils";
import { Flexbox } from "../../atoms";
import {
  KctoolsButton,
  LinkButton,
  MoreVertButton,
  TweetButton,
} from "../../molecules";
import { FileMenu } from "../../organisms";

export type PlanActionProps = {
  file: PlanEntity;
  org: Org;
  isTemp: boolean;
  actions: ReturnType<typeof useFile>["actions"];
};

const PlanAction: React.FCX<PlanActionProps> = ({
  className,
  file,
  org,
  isTemp,
  actions,
}) => {
  const { t } = useTranslation("common");
  const MenuModal = useModal();
  const { asyncOnPublish, onUrlCopy, onTweet, Snackbar } = useAsyncOnPublish(
    file.id
  );

  return (
    <>
      <Flexbox className={className} gap={1}>
        <LinkButton
          size="medium"
          title={t("CopySharedLinkToClipboard")}
          onClick={onUrlCopy}
          disabled={asyncOnPublish.loading}
        />
        <TweetButton
          size="medium"
          title="編成をツイート"
          onClick={() => {
            void onTweet();
          }}
          disabled={asyncOnPublish.loading}
        />
        <KctoolsButton
          size="medium"
          title="制空権シミュレータで開く"
          onClick={() => openKctools(org)}
        />
        <MoreVertButton
          size="medium"
          title="メニューを開く"
          onClick={MenuModal.show}
        />
        {isTemp && (
          <Fab color="primary" size="small" onClick={actions.save}>
            <SaveIcon />
          </Fab>
        )}
      </Flexbox>

      <MenuModal>
        <FileMenu id={file.id} onClose={MenuModal.hide} />
      </MenuModal>

      <Snackbar />
    </>
  );
};

export default PlanAction;
