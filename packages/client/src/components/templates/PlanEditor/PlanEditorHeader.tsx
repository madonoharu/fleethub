import React from "react"
import styled from "styled-components"
import copy from "copy-to-clipboard"
import { Plan, PlanState } from "@fleethub/core"
import { useAsyncCallback } from "react-async-hook"
import { createSelector } from "@reduxjs/toolkit"

import {
  Flexbox,
  NumberInput,
  TweetButton,
  ShareButton,
  PlanShareContent,
  LinkButton,
  KctoolsButton,
  ImportButton,
  PlanImportForm,
  TextField,
} from "../../../components"
import { useSnackbar, useModal } from "../../../hooks"
import { Update, openKctools } from "../../../utils"
import { publishPlan } from "../../../firebase"

const urlSelector = createSelector(
  (plan: PlanState) => plan,
  (plan) => publishPlan(plan)
)

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

const LevelInput = styled(NumberInput)`
  input {
    width: 26px;
  }
`

type Props = {
  plan: Plan
  update: Update<PlanState>
  onPlanImport?: (plan: Plan) => void
}

const PlanEditorHeader: React.FCX<Props> = ({ className, plan, update, onPlanImport }) => {
  const ShareModal = useModal()
  const ImportModal = useModal()
  const Snackbar = useSnackbar()

  const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    update((draft) => {
      draft.name = event.currentTarget.value
    })
  }

  const handleHqLevelChange = (next: number) => {
    update((draft) => {
      draft.hqLevel = next
    })
  }

  const asyncOnLinkClick = useAsyncCallback(
    async () => {
      const url = await urlSelector(plan.state)
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
    const url = await urlSelector(plan.state)
    tweet({ text: `【${plan.name}】`, url })
  })

  const handleOverwrite = (plan: Plan) => {
    update((draft) => {
      Object.assign(draft, plan.state)
    })
  }

  return (
    <Flexbox className={className}>
      <TextField startLabel="編成名" value={plan.name} onChange={handleNameChange} />
      <LevelInput startLabel="司令部Lv" value={plan.hqLevel} min={1} max={120} onChange={handleHqLevelChange} />

      <LinkButton title="共有URLをコピー" onClick={asyncOnLinkClick.execute} disabled={asyncOnLinkClick.loading} />
      <TweetButton title="編成をツイート" onClick={asyncOnTweetClick.execute} disabled={asyncOnTweetClick.loading} />
      <KctoolsButton title="制空権シミュレータで開く" onClick={() => openKctools(plan)} />
      <ImportButton title="デッキビルダー形式を読み込む" onClick={ImportModal.show} />
      <ShareButton title="デッキビルダー形式を出力したりします" onClick={ShareModal.show} />

      <ShareModal>
        <PlanShareContent plan={plan} />
      </ShareModal>
      <ImportModal>
        <PlanImportForm onOverwrite={handleOverwrite} onImport={onPlanImport} />
      </ImportModal>

      <Snackbar />
    </Flexbox>
  )
}

export default PlanEditorHeader
