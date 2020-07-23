import React from "react"
import styled from "styled-components"
import { Plan, PlanState } from "@fleethub/core"
import { useAsyncCallback } from "react-async-hook"

import { Flexbox, TweetButton, LinkButton, KctoolsButton, PlanMenu, MoreVertButton } from "../../../components"
import { useModal, useAsyncOnPublish } from "../../../hooks"
import { Update, openKctools } from "../../../utils"

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
  plan: Plan
  update: Update<PlanState>
}

const PlanAction: React.FCX<Props> = ({ className, id, plan }) => {
  const MenuModal = useModal()

  const { publish, asyncOnPublish, Snackbar } = useAsyncOnPublish(id)

  const asyncOnTweetClick = useAsyncCallback(async () => {
    const url = await publish()
    tweet({ text: `【${plan.name}】`, url })
  })

  return (
    <Flexbox className={className}>
      <LinkButton title="共有URLをコピー" onClick={asyncOnPublish.execute} disabled={asyncOnPublish.loading} />
      <TweetButton title="編成をツイート" onClick={asyncOnTweetClick.execute} disabled={asyncOnTweetClick.loading} />
      <KctoolsButton title="制空権シミュレータで開く" onClick={() => openKctools(plan)} />
      <MoreVertButton title="メニューを開く" onClick={MenuModal.show} />

      <MenuModal>
        <PlanMenu id={id} />
      </MenuModal>

      <Snackbar />
    </Flexbox>
  )
}

export default PlanAction
