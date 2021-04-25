import { Plan } from "@fleethub/core";
import React from "react";
import { useAsyncCallback } from "react-async-hook";

import {
  FileMenu,
  Flexbox,
  KctoolsButton,
  LinkButton,
  MoreVertButton,
  SaveButton,
  TweetButton,
} from "../../../components";
import { useAsyncOnPublish, useFile, useModal } from "../../../hooks";
import { openKctools } from "../../../utils";

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

type Props = {
  id: string;
  name: string;
  plan: Plan;
};

const PlanAction: React.FCX<Props> = ({ className, id, name, plan }) => {
  const MenuModal = useModal();

  const { isTemp, actions } = useFile(id);
  const { publish, asyncOnPublish, Snackbar } = useAsyncOnPublish(id);

  const asyncOnTweetClick = useAsyncCallback(async () => {
    const url = await publish();
    tweet({ text: `【${name}】`, url });
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
