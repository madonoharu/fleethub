import { Org } from "fleethub-core";

import { createDeck } from "./deck";

const MAX_LENGTH = 7350;

const getPredeckUrl = (base: string, org?: Org | undefined) => {
  const url = new URL(base);
  const deck = createDeck(org);

  url.searchParams.set("predeck", JSON.stringify(deck));
  if (url.href.length < MAX_LENGTH) {
    return url.href;
  }

  delete deck.f3;
  delete deck.f4;
  url.searchParams.set("predeck", JSON.stringify(deck));
  return url.href;
};

export const openKctools = (org?: Org | undefined) => {
  const url = getPredeckUrl("https://noro6.github.io/kcTools/", org);
  window.open(url, "_blank", "noopener");
};

export const openDeckbuilder = (org?: Org | undefined) => {
  const url = getPredeckUrl("http://kancolle-calc.net/deckbuilder.html", org);
  window.open(url, "_blank", "noopener");
};

type TweetOption = {
  text: string;
  url: string;
};

export const tweet = ({ text, url }: TweetOption) => {
  const tweetUrl = new URL("https://twitter.com/intent/tweet");
  tweetUrl.searchParams.set("text", text);
  tweetUrl.searchParams.set("url", url);
  window.open(tweetUrl.href, "_blank", "width=480,height=400,noopener");
};
