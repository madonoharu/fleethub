import React from "react"
import { PlanState } from "@fleethub/core"
import { useAsyncCallback } from "react-async-hook"

import { TweetButton } from "../../../components"
import { createShareUrlByPlan } from "../../../firebase"

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

const PlanTweetButton: React.FC<{ plan: PlanState }> = ({ plan }) => {
  const asyncOnClick = useAsyncCallback(async () => {
    const url = await createShareUrlByPlan(plan)
    tweet({ text: `編成 ${plan.name}`, url })
  })

  return <TweetButton title="編成をツイート" onClick={asyncOnClick.execute} disabled={asyncOnClick.loading} />
}

export default PlanTweetButton
