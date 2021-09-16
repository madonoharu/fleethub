import { Org } from "@fh/core";
import React from "react";

import { useAsyncOnPublish, useFile, useModal } from "../../../hooks";
import { PlanFileEntity } from "../../../store";
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
  file: PlanFileEntity;
  org: Org;
  actions: ReturnType<typeof useFile>["actions"];
};

const PlanAction: React.FCX<PlanActionProps> = ({ className, file, org }) => {
  const MenuModal = useModal();
  const { asyncOnPublish, onUrlCopy, onTweet, Snackbar } = useAsyncOnPublish(
    file.id
  );

  return (
    <>
      <Flexbox className={className}>
        <LinkButton
          title="共有URLをコピー"
          onClick={onUrlCopy}
          disabled={asyncOnPublish.loading}
        />
        <TweetButton
          title="編成をツイート"
          onClick={onTweet}
          disabled={asyncOnPublish.loading}
        />
        <KctoolsButton
          title="制空権シミュレータで開く"
          onClick={() => openKctools(org)}
        />
        <MoreVertButton title="メニューを開く" onClick={MenuModal.show} />
      </Flexbox>

      <MenuModal>
        <FileMenu id={file.id} onClose={MenuModal.hide} />
      </MenuModal>

      <Snackbar />
    </>
  );
};

export default PlanAction;
