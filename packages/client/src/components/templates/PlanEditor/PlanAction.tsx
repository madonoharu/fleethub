import React from "react"
import styled from "styled-components"
import copy from "copy-to-clipboard"
import { Plan, PlanState } from "@fleethub/core"
import { useAsyncCallback } from "react-async-hook"
import { useDispatch } from "react-redux"

import {
  Flexbox,
  TweetButton,
  ShareButton,
  PlanShareContent,
  LinkButton,
  KctoolsButton,
  ImportButton,
  PlanImportForm,
  PlanMenu,
  MoreVertButton,
} from "../../../components"
import { useModal, useAsyncOnPublish } from "../../../hooks"
import { Update, openKctools } from "../../../utils"
import { filesSlice } from "../../../store"

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

const PlanAction: React.FCX<Props> = ({ className, id, plan, update }) => {
  const ShareModal = useModal()
  const ImportModal = useModal()
  const MenuModal = useModal()

  const dispatch = useDispatch()

  const { publish, asyncOnPublish, Snackbar } = useAsyncOnPublish(id)

  const asyncOnTweetClick = useAsyncCallback(async () => {
    const url = await publish()
    tweet({ text: `【${plan.name}】`, url })
  })

  const handleOverwrite = (plan: Plan) => {
    update((draft) => {
      Object.assign(draft, plan.state)
    })
  }

  const handleImport = (plan: Plan) => {
    dispatch(filesSlice.actions.createPlan({ plan: plan.state, to: "root" }))
  }

  return (
    <Flexbox className={className}>
      <LinkButton title="共有URLをコピー" onClick={asyncOnPublish.execute} disabled={asyncOnPublish.loading} />
      <TweetButton title="編成をツイート" onClick={asyncOnTweetClick.execute} disabled={asyncOnTweetClick.loading} />
      <KctoolsButton title="制空権シミュレータで開く" onClick={() => openKctools(plan)} />
      <ImportButton title="デッキビルダー形式を読み込む" onClick={ImportModal.show} />
      <ShareButton title="デッキビルダー形式を出力したりします" onClick={ShareModal.show} />
      <MoreVertButton title="メニューを開く" onClick={MenuModal.show} />

      <ShareModal>
        <PlanShareContent plan={plan} />
      </ShareModal>
      <ImportModal>
        <PlanImportForm onOverwrite={handleOverwrite} onImport={handleImport} />
      </ImportModal>
      <MenuModal>
        <PlanMenu id={id} />
      </MenuModal>

      <Snackbar />
    </Flexbox>
  )
}

export default PlanAction
