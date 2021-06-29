import { Plan } from "@fleethub/core";
import React from "react";
import { useAsyncCallback } from "react-async-hook";

import { useAsyncOnPublish, useFile, useModal } from "../../../hooks";
import { openKctools } from "../../../utils";
import { Flexbox } from "../../atoms";
import {
  KctoolsButton,
  LinkButton,
  MoreVertButton,
  SaveButton,
  TweetButton,
} from "../../molecules";
import { FileMenu } from "../../organisms";

type TweetOption = {
  text: string;
  url: string;
};

const tweet = ({ text, url }: TweetOption) => {
  const tweetUrl = new URL("https://twitter.com/intent/tweet");
  tweetUrl.searchParams.set("text", text);
  tweetUrl.searchParams.set("url", url);
  window.open(tweetUrl.href, "_blank", "width=480,height=400,noopener");
};

type PlanActionProps = {
  plan: Plan;
};

const PlanAction: React.FCX<PlanActionProps> = ({ className, plan }) => {
  const MenuModal = useModal();

  const { id } = plan;

  const { isTemp, actions, file } = useFile(id);
  const { publish, asyncOnPublish, Snackbar } = useAsyncOnPublish(id);

  const asyncOnTweetClick = useAsyncCallback(async () => {
    if (!file) return;

    const url = await publish();
    tweet({ text: `【${file.name}】`, url });
  });

  return (
    <>
      <Flexbox className={className}>
        <LinkButton
          title="共有URLをコピー"
          onClick={asyncOnPublish.execute}
          disabled={asyncOnPublish.loading}
        />
        <TweetButton
          title="編成をツイート"
          onClick={asyncOnTweetClick.execute}
          disabled={asyncOnTweetClick.loading}
        />
        <KctoolsButton
          title="制空権シミュレータで開く"
          onClick={() => openKctools(plan)}
        />
        <MoreVertButton title="メニューを開く" onClick={MenuModal.show} />
        {isTemp && <SaveButton title="保存する" onClick={actions.save} />}
      </Flexbox>

      <MenuModal>
        <FileMenu id={id} onClose={MenuModal.hide} />
      </MenuModal>
      <Snackbar />
    </>
  );
};

export default PlanAction;
