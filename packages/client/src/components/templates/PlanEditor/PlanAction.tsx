import React from "react"
import styled from "styled-components"
import { Plan } from "@fleethub/core"
import { useAsyncCallback } from "react-async-hook"

import {
  Flexbox,
  TweetButton,
  LinkButton,
  KctoolsButton,
  PlanMenu,
  MoreVertButton,
  SaveButton,
} from "../../../components"
import { useModal, useAsyncOnPublish, useFile } from "../../../hooks"
import { openKctools } from "../../../utils"

type TweetOption = {
  text: string
  url: string
}

const tweet = ({ text, url }: TweetOption) => {
  const tweetUrl = new URL("https://twitter.com/intent/tweet")
  tweetUrl.searchParams.set("text", text)
  tweetUrl.searchParams.set("url", url)
  window.open(tweetUrl.href, "_blank", "width=480,height=400,noopener")
}

type Props = {
  id: string
  name: string
  plan: Plan
}

const PlanAction: React.FCX<Props> = ({ className, id, name, plan }) => {
  const MenuModal = useModal()

  const { isTemp, actions } = useFile(id)
  const { publish, asyncOnPublish, Snackbar } = useAsyncOnPublish(id)

  const asyncOnTweetClick = useAsyncCallback(async () => {
    const url = await publish()
    tweet({ text: `【${name}】`, url })
  })

  return (
    <Flexbox className={className}>
      <LinkButton title="共有URLをコピー" onClick={asyncOnPublish.execute} disabled={asyncOnPublish.loading} />
      <TweetButton title="編成をツイート" onClick={asyncOnTweetClick.execute} disabled={asyncOnTweetClick.loading} />
      <KctoolsButton title="制空権シミュレータで開く" onClick={() => openKctools(plan)} />
      <MoreVertButton title="メニューを開く" onClick={MenuModal.show} />
      {isTemp && <SaveButton title="保存する" onClick={actions.save} />}

      <MenuModal>
        <PlanMenu id={id} onClose={MenuModal.hide} />
      </MenuModal>

      <Snackbar />
    </Flexbox>
  )
}

export default PlanAction
