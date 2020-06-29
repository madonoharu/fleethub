import React from "react"
import { Plan, PlanState } from "@fleethub/core"
import { useAsyncCallback } from "react-async-hook"
import { createSelector } from "@reduxjs/toolkit"

import { Container, TextField, CircularProgress, Link } from "@material-ui/core"

import {
  Flexbox,
  NumberInput,
  TweetButton,
  SelectButtons,
  ShareButton,
  PlanShareContent,
  LinkButton,
  KctoolsButton,
  CopyTextButton,
} from "../../../components"
import { usePlan, useModal } from "../../../hooks"
import { Update } from "../../../utils"
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
  window.open(tweetUrl.href, "_blank")
}

type Props = {
  plan: Plan
  update: Update<PlanState>
}

const PlanEditorHeader: React.FC<Props> = ({ plan, update }) => {
  const Modal = useModal()
  const LinkModal = useModal()
  const [url, setUrl] = React.useState("")

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

  const asyncOnLinkClick = useAsyncCallback(async () => {
    const url = await urlSelector(plan.state)
    setUrl(url)
    LinkModal.show()
  })

  const asyncOnTweetClick = useAsyncCallback(async () => {
    const url = await urlSelector(plan.state)
    tweet({ text: `編成 ${plan.name}`, url })
  })

  return (
    <Flexbox>
      <TextField value={plan.name} onChange={handleNameChange} />
      <NumberInput style={{ width: 60 }} value={plan.hqLevel} min={1} max={120} onChange={handleHqLevelChange} />

      {asyncOnLinkClick.loading ? (
        <CircularProgress style={{ height: 48, width: 48 }} />
      ) : (
        <LinkButton onClick={asyncOnLinkClick.execute} />
      )}

      {asyncOnTweetClick.loading ? (
        <CircularProgress style={{ height: 48, width: 48 }} />
      ) : (
        <TweetButton onClick={asyncOnTweetClick.execute} />
      )}
      <KctoolsButton onClick={asyncOnTweetClick.execute} />
      <ShareButton onClick={Modal.show} />

      <Modal>
        <PlanShareContent plan={plan} />
      </Modal>

      <LinkModal>
        <Link href={url}>{url}</Link>
        <CopyTextButton value={url} />
      </LinkModal>
    </Flexbox>
  )
}

export default PlanEditorHeader
