import React from "react"
import styled from "styled-components"
import copy from "copy-to-clipboard"
import { Plan, PlanState } from "@fleethub/core"
import { useAsyncCallback } from "react-async-hook"
import { createSelector } from "@reduxjs/toolkit"
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
} from "../../../components"
import { useSnackbar, useModal } from "../../../hooks"
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
  plan: Plan
  update: Update<PlanState>
  onPublish: () => Promise<string>
}

const PlanAction: React.FCX<Props> = ({ className, plan, update, onPublish }) => {
  const ShareModal = useModal()
  const ImportModal = useModal()
  const Snackbar = useSnackbar()

  const dispatch = useDispatch()

  const asyncOnLinkClick = useAsyncCallback(
    async () => {
      const url = await onPublish()
      const result = copy(url)
      if (!result) throw new Error("Failed to copy")

      return url
    },
    {
      onSuccess: () => Snackbar.show({ message: "共有URLをコピーしました", severity: "success" }),
      onError: (error) => {
        console.error(error)
        Snackbar.show({ message: "失敗しました", severity: "error" })
      },
    }
  )

  const asyncOnTweetClick = useAsyncCallback(async () => {
    const url = await onPublish()
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
      <LinkButton title="共有URLをコピー" onClick={asyncOnLinkClick.execute} disabled={asyncOnLinkClick.loading} />
      <TweetButton title="編成をツイート" onClick={asyncOnTweetClick.execute} disabled={asyncOnTweetClick.loading} />
      <KctoolsButton title="制空権シミュレータで開く" onClick={() => openKctools(plan)} />
      <ImportButton title="デッキビルダー形式を読み込む" onClick={ImportModal.show} />
      <ShareButton title="デッキビルダー形式を出力したりします" onClick={ShareModal.show} />

      <ShareModal>
        <PlanShareContent plan={plan} />
      </ShareModal>
      <ImportModal>
        <PlanImportForm onOverwrite={handleOverwrite} onImport={handleImport} />
      </ImportModal>

      <Snackbar />
    </Flexbox>
  )
}

export default PlanAction
